# Quiz Generator
Generates quizes with a random order of questions and answers.

Input folder consists of:
- question files with `.md` or `.txt` extensions
- questions are in Markdown format
- first line is the question, the rest are the answers.
- Lines starting with `#` and empty lines are omitted
- file `header.md` gets prepended to the test

Example question file:
```md
Isn't this awesome?
Yes it is
No it's not

# Blank lines and comments get ommited
```
