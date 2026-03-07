// Constants and theme configuration

export const ALL_TERMS = ["W24", "S24", "F24", "W25", "S25", "F25", "W26"];
export const SKILL_OPTIONS = [
  "React",
  "TypeScript",
  "Python",
  "ML/AI",
  "Embedded C",
  "PCB Design",
  "CAD",
  "Rust",
  "Node.js",
  "FPGA",
  "Computer Vision",
  "iOS",
  "Java",
  "C++",
  "Figma",
  "Verilog",
  "Swift",
  "Docker",
];
export const DISCIPLINE_OPTIONS = [
  "ECE",
  "MTE",
  "SE",
  "CE",
  "ME",
  "CHE",
  "CIVE",
  "ENVE",
  "NANO",
  "SYDE",
  "TRON",
  "BME",
];
export const YEAR_OPTIONS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
export const INTEREST_OPTIONS = [
  "Volleyball",
  "Badminton",
  "Basketball",
  "Soccer",
  "Chess",
  "Hiking",
  "Music",
  "Gaming",
  "Photography",
  "Cooking",
  "Running",
  "Tennis",
];
export const CATEGORIES_BUILD = [
  "SOFTWARE",
  "HARDWARE",
  "RESEARCH",
  "STARTUP",
  "DESIGN",
];
export const CATEGORIES_CREW = [
  "SPORT",
  "MUSIC",
  "GAMING",
  "ART",
  "SOCIAL",
  "FOOD",
];
export const STAGES = ["IDEA", "POC", "PROTOTYPE", "SCALING"];
export const COMMITMENTS = ["CASUAL", "SERIOUS", "STARTUP"];
export const ACTIVITY_TYPES = ["RECREATIONAL", "COMPETITIVE", "ONE-TIME"];

export const C = {
  bg: "#F5F2EB",
  surface: "#EDEAE1",
  surface2: "#E5E1D6",
  detail: "#EFECE3",
  ink: "#15150D",
  body: "#3a3a28",
  muted: "#7a7a62",
  rule: "#D8D4C6",
  lime: "#AACC00",
  limeLight: "#F0F9C0",
  limeDark: "#8aaa00",
  limeInk: "#2d3a00",
  red: "#CC3300",
  redLight: "#FFF0ED",
  amber: "#CC8800",
  amberLight: "#FFF8E0",
};

export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bebas+Neue&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.bg}; }
  ::selection { background:${C.lime}; color:${C.limeInk}; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:${C.rule}; }
  input, textarea, button, select { font-family:'IBM Plex Mono',monospace; }
  input::placeholder, textarea::placeholder { color:${C.muted}; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  .fade-up  { animation:fadeUp  0.3s  both; }
  .slide-in { animation:slideIn 0.25s both; }
  @media(max-width:860px){
    .app-layout { flex-direction:column !important; }
    .app-sidebar { width:100% !important; max-height:220px !important; border-right:none !important; border-bottom:1px solid ${C.rule} !important; }
  }
  @media(max-width:540px){ .topbar-meta { display:none !important; } }
`;
