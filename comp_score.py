
# ignore this

def comp_score(student, required):
    intersection = student & required
    union = student | required

    score = len(intersection)/len(union)

    return score*100


student = {"Python", "React", "SQL"}
required = {"Python", "React", "AWS"}

print(comp_score(student, required))
