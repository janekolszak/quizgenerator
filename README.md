# Quiz Generator
Generates quizes with a random order of questions and answers.

Input folder consists of:
- question files with `.md` or `.txt` extensions
- questions are in Markdown format
- first line is the question, the rest are the answers.
- lines starting with `#` and empty lines are ignored
- file named `header.md` gets prepended to each test

Example question file:
```md
Isn't this awesome?
Yes it is
No it's not

# Blank lines and comments get ommited
```
Example `header.md` file:
```md
Test 1

First Name:
Last Name:
Date:

```
