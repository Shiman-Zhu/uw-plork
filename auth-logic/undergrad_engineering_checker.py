import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import webbrowser
import asyncio
import pickle
import os

class ADFSAuthenticator:

    def __init__(self, start_url, username, password):
        self.start_url = start_url
        self.username = username
        self.password = password
        self.session = requests.Session()
        # optional cookie file path for persisting/loading browser cookies
        self.cookie_file = os.path.join(os.getcwd(), "cookies.pkl")

    def get_login_page(self):
        r = self.session.get(self.start_url, allow_redirects=True)
        return r

    def detect_form(self, html, base_url):
        soup = BeautifulSoup(html, "lxml")

        # Prefer the explicit form id if present, otherwise locate the form
        form = soup.find("form", {"id": "searchForm"})
        if not form:
            # fallback: find a form that contains the search input id
            search_input_any = soup.find("input", {"id": "searchForm:searchTerm"})
            if search_input_any:
                form = search_input_any.find_parent("form")

        if not form:
            # last resort: pick the first form that looks like a search (has searchTerm name/id)
            for f in soup.find_all("form"):
                if f.find("input", {"id": "searchForm:searchTerm"}) or f.find("input", {"name": "searchForm:searchTerm"}):
                    form = f
                    break

        if not form:
            print("Search form not found in document")
            return None

        action = form.get("action")
        if not action:
            # some frameworks use javascript to submit to current URL; use base_url in that case
            action = base_url
        else:
            action = urljoin(base_url, str(action))

        # Find the search input field by id or name
        search_input = form.find("input", {"id": "searchForm:searchTerm"}) or form.find("input", {"name": "searchForm:searchTerm"})
        if not search_input:
            # also try any text input that looks like a search term
            search_input = None
            for inp in form.find_all("input"):
                t = inp.get("type", "text")
                name = inp.get("name", "") or ""
                name = str(name).lower()
                if t in ("text", "search") and ("search" in name or "term" in name or "name" in name):
                    search_input = inp
                    break

        if not search_input:
            print("Search input not found in form")
            return None

        search_field_name = search_input.get("name")
        if not search_field_name:
            print("Search input has no name attribute")
            return None

        # Find the search submit control (button or input[type=submit])
        search_button = form.find("button", {"id": "searchForm:simpleSearchButton"}) or form.find("input", {"id": "searchForm:simpleSearchButton"})
        if not search_button:
            # fallback: any submit button within the form
            search_button = form.find(lambda tag: (tag.name == "button" or tag.name == "input") and tag.get("type") in ("submit", "button"))

        button_name = search_button.get("name") if search_button else None
        button_value = search_button.get("value", "Search") if search_button else "Search"

        # Collect all form inputs (hidden fields, etc.)
        payload = {}
        for inp in form.find_all("input"):
            name = inp.get("name")
            if not name:
                continue
            value = inp.get("value", "")
            payload[name] = value

        return action, payload, search_field_name, button_name, button_value

    def submit_credentials(self, action, payload, user_field, pass_field):
        payload[user_field] = self.username
        payload[pass_field] = self.password

        r = self.session.post(action, data=payload)
        return r

    def submit_search(self, action, payload, search_field, button_name, button_value, query):
        payload[search_field] = query
        # Add the button that was clicked to the payload
        if button_name:
            payload[button_name] = button_value

        r = self.session.post(action, data=payload)
        return r

    def detect_token(self, html):
        soup = BeautifulSoup(html, "lxml")

        saml = soup.find("input", {"name": "SAMLResponse"})
        wresult = soup.find("input", {"name": "wresult"})

        relay = soup.find("input", {"name": "RelayState"})
        wctx = soup.find("input", {"name": "wctx"})

        form = soup.find("form")

        if not form:
            return None

        action = form.get("action")

        if saml:
            return {
                "type": "SAML",
                "action": action,
                "token": saml.get("value"),
                "relay": relay.get("value") if relay else ""
            }

        if wresult:
            return {
                "type": "WSFED",
                "action": action,
                "token": wresult.get("value"),
                "relay": wctx.get("value") if wctx else ""
            }

        return None

    def submit_token(self, token_data):

        if token_data["type"] == "SAML":

            payload = {
                "SAMLResponse": token_data["token"],
                "RelayState": token_data["relay"]
            }

        else:

            payload = {
                "wresult": token_data["token"],
                "wctx": token_data["relay"]
            }

        r = self.session.post(token_data["action"], data=payload)

        return r

    def open_in_browser_with_cookies(self, redirect_url: str, browser: str = "chrome", cookie_file: str | None = None) -> bool:
        """Open `redirect_url` in a real browser and copy session cookies into it.

        This helps the user complete Duo 2FA interactively in the browser while
        the script retains the same authenticated session cookies.
        Returns True if a browser was opened, False otherwise.
        """
        try:
            from selenium import webdriver
            from selenium.common.exceptions import WebDriverException
        except Exception as exc:
            print("Selenium not available:", exc)
            return False

        print(f"Attempting to open {browser} browser for 2FA...")
        print("If this fails, please complete 2FA manually by visiting:", redirect_url)
        parsed = urlparse(redirect_url)
        base = f"{parsed.scheme}://{parsed.netloc}"

        try:
            if browser == "chrome":
                from selenium.webdriver.chrome.options import Options as ChromeOptions
                from selenium.webdriver.chrome.webdriver import WebDriver as ChromeWebDriver
                options = ChromeOptions()
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                driver = ChromeWebDriver(options=options)
            else:
                from selenium.webdriver.firefox.options import Options as FxOptions
                from selenium.webdriver.firefox.webdriver import WebDriver as FirefoxWebDriver
                options = FxOptions()
                driver = FirefoxWebDriver(options=options)
        except WebDriverException as exc:
            print("Failed to start WebDriver:", exc)
            return False

        try:
            # Open base domain first so cookies can be set
            driver.get(base)

            # If a cookie file exists, preload those cookies into the browser
            try:
                in_file = cookie_file or self.cookie_file
                if in_file and os.path.exists(in_file):
                    with open(in_file, "rb") as fh:
                        cookies = pickle.load(fh)
                    for c in cookies:
                        try:
                            driver.add_cookie(c)
                        except Exception:
                            pass
            except Exception:
                pass

            # Copy cookies from requests session into browser
            for name, value in self.session.cookies.get_dict().items():
                cookie = {"name": name, "value": value, "path": "/"}
                if parsed.hostname:
                    cookie["domain"] = parsed.hostname
                try:
                    driver.add_cookie(cookie)
                except Exception:
                    # Ignore cookies that can't be set
                    pass

            driver.get(redirect_url)
            print("Opened browser. Complete Duo 2FA there.")
            # persist cookies to a pickle file so the user can reuse them later
            try:
                out_file = cookie_file or self.cookie_file
                if out_file:
                    with open(out_file, "wb") as fh:
                        pickle.dump(driver.get_cookies(), fh)
            except Exception:
                pass
            return True
        except Exception as exc:
            print("Error driving browser:", exc)
            try:
                driver.quit()
            except Exception:
                pass
            return False

    def save_cookies_to_file(self, path: str | None = None):
        """Persist current requests.Session cookies to a pickle file in
        a list-of-dicts format compatible with Selenium's cookie structure.
        """
        try:
            out_file = path or self.cookie_file
            if not out_file:
                return False
            cookies = []
            for c in self.session.cookies:
                cookies.append({
                    "name": c.name,
                    "value": c.value,
                    "domain": getattr(c, "domain", None),
                    "path": getattr(c, "path", "/")
                })
            with open(out_file, "wb") as fh:
                pickle.dump(cookies, fh)
            return True
        except Exception:
            return False

    def load_cookies_from_file(self, path: str | None = None):
        """Load cookies from a pickle file and inject into requests.Session.
        Expects a list of cookie dicts with keys: name, value, domain, path.
        """
        try:
            in_file = path or self.cookie_file
            if not in_file or not os.path.exists(in_file):
                return False
            with open(in_file, "rb") as fh:
                cookies = pickle.load(fh)
            for c in cookies:
                name = c.get("name")
                value = c.get("value")
                domain = c.get("domain")
                path = c.get("path", "/")
                if name and value:
                    try:
                        if domain:
                            self.session.cookies.set(name, value, domain=domain, path=path)
                        else:
                            self.session.cookies.set(name, value)
                    except Exception:
                        self.session.cookies.set(name, value)
            return True
        except Exception:
            return False

    def wait_for_2fa(self, redirect_url: str, check_url: str, timeout: int = 300, interval: int = 5, open_browser: bool = True):
        """Wait for user to complete Duo 2FA and return the final authenticated response.

        This opens a browser for the user to complete 2FA, then polls the check_url
        to see if the session is authenticated.
        """
        if open_browser:
            # try to open browser and persist cookies if possible
            self.open_in_browser_with_cookies(redirect_url, cookie_file=self.cookie_file)

        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                r = self.session.get(check_url, allow_redirects=True)
                # Check if we're no longer redirected to 2FA page
                soup = BeautifulSoup(r.text or "", "lxml")
                redirect_link = soup.find("a", {"id": "manual-redirect-action"})
                if not redirect_link:
                    # 2FA appears to be complete
                    # try to persist cookies from an external cookie file if present
                    try:
                        if os.path.exists(self.cookie_file) and not self.session.cookies:
                            # load cookies and set into requests session
                            with open(self.cookie_file, "rb") as fh:
                                cookies = pickle.load(fh)
                            for c in cookies:
                                name = c.get("name")
                                value = c.get("value")
                                domain = c.get("domain") if c.get("domain") else None
                                path = c.get("path", "/")
                                if name and value:
                                    try:
                                        if domain:
                                            self.session.cookies.set(name, value, domain=domain, path=path)
                                        else:
                                            self.session.cookies.set(name, value)
                                    except Exception:
                                        self.session.cookies.set(name, value)
                    except Exception:
                        pass
                    return r
            except Exception as exc:
                print(f"Error checking session: {exc}")

            time.sleep(interval)

        raise Exception(f"2FA timeout after {timeout} seconds")

    async def search_async(self, first_name: str, last_name: str, url: str | None = None, timeout: int = 300):
        """Asynchronous wrapper around `search` that waits for 2FA when needed.

        This runs blocking network calls in the default executor so it can be awaited.
        """
        loop = asyncio.get_running_loop()
        if url is None:
            url = self.start_url

        # Initial fetch (in executor)
        r = await loop.run_in_executor(None, lambda: self.session.get(url if url is not None else self.start_url))

        # If an OIDC redirect page is returned, prompt user to complete Duo
        soup = BeautifulSoup(r.text or "", "lxml")
        redirect_link = soup.find("a", {"id": "manual-redirect-action"})
        if redirect_link:
            redirect_url = redirect_link.get("href")
            if redirect_url:
                redirect_url = urljoin(r.url, str(redirect_url))
                print(f"Following OIDC redirect to: {redirect_url}")

                # Try to open browser with cookies; non-blocking
                try:
                    print("Attempting to open browser for 2FA...")
                    opened = await loop.run_in_executor(None, self.open_in_browser_with_cookies, redirect_url)
                except Exception:
                    opened = False

                # Wait for the user to complete Duo 2FA (blocking function in executor)
                final_resp = await loop.run_in_executor(None, self.wait_for_2fa, redirect_url, self.start_url, timeout, 5)
        else:
            final_resp = r

        # Now perform the search synchronously in executor (reuses existing logic)
        result = await loop.run_in_executor(None, self.search, first_name, last_name, url)
        return result

    def search(self, first_name, last_name, url=None):
        if url is None:
            url = self.start_url

        query = f"{first_name} {last_name}".strip()

        print("Fetching search page")

        r = self.session.get(url)

        # Check if it's a redirect page and follow it
        soup = BeautifulSoup(r.text, "lxml")
        redirect_link = soup.find("a", {"id": "manual-redirect-action"})
        if redirect_link:
            redirect_url = redirect_link.get("href")
            if redirect_url:
                redirect_url = urljoin(r.url, str(redirect_url))
                print(f"Following OIDC redirect to: {redirect_url}")
                r = self.session.get(redirect_url, allow_redirects=True)

        form_data = self.detect_form(r.text, r.url)

        if not form_data:
            raise Exception("Search form not found")

        action, payload, search_field_name, button_name, button_value = form_data

        print("Submitting search query")

        result = self.submit_search(action, payload, search_field_name, button_name, button_value, query)

        print("Search complete")

        # Parse the results
        parsed_results = self.parse_search_results(result.text)

        return result, parsed_results

    def parse_search_results(self, html):
        soup = BeautifulSoup(html, "lxml")
        # Assuming results are in a table or list; adjust selectors as needed
        results = []
        # Example: find all rows in a results table
        table = soup.find("table", {"id": "searchResults"})  # Adjust ID based on actual HTML
        if table:
            rows = table.find_all("tr")[1:]  # Skip header
            for row in rows:
                cols = row.find_all("td")
                if len(cols) >= 3:  # Assuming columns: Name, Email, etc.
                    name = cols[0].get_text(strip=True)
                    email = cols[1].get_text(strip=True)
                    results.append({"name": name, "email": email})
        return results

    def authenticate(self):
        print("Starting federation flow")

        r = self.get_login_page()

        # Check if it's a redirect page
        soup = BeautifulSoup(r.text, "lxml")
        redirect_link = soup.find("a", {"id": "manual-redirect-action"})
        if redirect_link:
            redirect_url = redirect_link.get("href")
            if redirect_url:
                redirect_url = urljoin(r.url, str(redirect_url))
                print(f"Following redirect to: {redirect_url}")
                r = self.session.get(redirect_url, allow_redirects=True)

        # Now find the login form
        soup = BeautifulSoup(r.text, "lxml")
        form = soup.find("form")
        if not form:
            raise Exception("Login form not found")

        action = form.get("action")
        if not action:
            raise Exception("No action in form")
        action = urljoin(r.url, str(action))

        inputs = form.find_all("input")
        payload = {}
        user_field = None
        pass_field = None

        for inp in inputs:
            name = inp.get("name")
            value = inp.get("value", "")
            if not name:
                continue
            payload[name] = value
            lname = str(name).lower()
            if "user" in lname or "email" in lname:
                user_field = name
            if "pass" in lname:
                pass_field = name

        if not user_field or not pass_field:
            raise Exception("Username or password field not found")

        print("Submitting credentials")

        payload[user_field] = self.username
        payload[pass_field] = self.password

        r2 = self.session.post(action, data=payload)

        token = self.detect_token(r2.text)

        if not token:
            raise Exception("Federation token not found")

        print("Token type:", token["type"])

        final = self.submit_token(token)

        # Check if the response contains an OIDC redirect
        soup = BeautifulSoup(final.text, "lxml")
        redirect_link = soup.find("a", {"id": "manual-redirect-action"})
        if redirect_link:
            redirect_url = redirect_link.get("href")
            if redirect_url:
                redirect_url = urljoin(final.url, str(redirect_url))
                print(f"Following OIDC authorization redirect to: {redirect_url}")
                # Prompt user to complete Duo 2FA in their browser and wait for session
                final = self.wait_for_2fa(redirect_url, check_url=self.start_url, timeout=300, interval=5, open_browser=True)

        print("Authentication complete")

        # persist session cookies to file for reuse by Selenium or future runs
        try:
            saved = self.save_cookies_to_file()
            if saved:
                print("Session cookies saved to:", self.cookie_file)
        except Exception:
            pass

        return final


if __name__ == "__main__":

    START_URL = "https://iamtools.uwaterloo.ca/directory/"
    FIRST_NAME = "SHIMAN"
    LAST_NAME = "ZHU"
    USERNAME = "s267zhu@uwaterloo.ca"
    PASSWORD = "Zsm@123456"

    auth = ADFSAuthenticator(START_URL, USERNAME, PASSWORD)

    result = auth.authenticate()

    print("HTTP Status:", result.status_code)

    print("Session Cookies:")
    print(auth.session.cookies.get_dict())

    # Example search after login
    search_response, parsed_results = auth.search(FIRST_NAME, LAST_NAME)

    print("Search status:", search_response.status_code)
    print("Parsed results:", parsed_results)