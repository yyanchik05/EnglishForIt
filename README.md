# IT.English_ 

> **while(alive) { learn_english(); }**

An interactive, IDE-style platform designed to help IT professionals master technical English. Forget about "London is the capital of Great Britain". Learn how to write commit messages, report bugs, and negotiate salaries.

(![Project Preview](./images)) 

Video on YouTube : https://youtu.be/ZJFswraytc4

Link on the site: https://it-english-beryl.vercel.app/

## Features

* **IDE Simulation UI:** Dark theme, file explorer, terminal output, and syntax highlighting.
* **Career-Based Levels:**
    * **Junior:** Git commands, Error messages, Daily reports.
    * **Middle:** Soft skills, Code review etiquette, Mentoring.
    * **Senior:** System architecture, Crisis management, Client negotiations.
* **Interactive Tasks:**
    * `Choice`: Select the correct option.
    * `Input`: Type the missing code/word manually.
    * `Builder`: Construct sentences from code fragments (f-strings).
* **Gamification:**
    * **Leaderboard:** Compete with other developers.
    * **Contribution Graph:** GitHub-style activity tracking.
    * **Ranks:** From *Intern* to *CTO* based on XP.
* **Knowledge Base:** Built-in dictionary and documentation links.
* **Authentication:** Full user system via Firebase (Sign Up, Login, Profile).

## Tech Stack

* **Frontend:** React (Vite)
* **Routing:** React Router DOM
* **Styling:** CSS-in-JS, Framer Motion (Animations), Lucide React (Icons)
* **Backend / BaaS:** Firebase (Authentication, Firestore Database)
* **Code Highlighting:** React Syntax Highlighter

## Database Structure (Firestore)

### `tasks` Collection
Documents should have this structure:
```json
{
  "title": "Git Merge",
  "category": "Git & Actions",
  "level": "junior",
  "type": "builder", // or 'choice', 'input'
  "code": "git_history = f\"{____}\"",
  "correct": "I merged the feature branch",
  "fragments": ["I", "merged", "feature", "branch"], // array
  "option_a": "...", // if type is 'choice'
  "option_b": "..."
}
```

### `leaderboard` Collection
Documents are created automatically when a user solves a task.
```json
{
  "username": "User Nickname",
  "score": 42
}
```

### `user_progress` Collection
Stores history of completed tasks (used for the contribution graph).

