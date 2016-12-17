# Quiz Generator
Generates quizes with a random order of questions and answers.

Input folder consists of:
- questions in `.md` or `.txt` format, for example:

- First line is the question, the rest are the answers.
- File `header.md` gets prepended to the test

For example:
```md
Isn't this awesome?
Yes it is
No it's not

# Blank lines and comments get ommited
```