# Front End ReadME

## Quickstart

- Nodejs is required in order to run this project download it [from the node js website](https://nodejs.org/en).
- Once Nodejs is installed navigate into the FrontEnd Directory and run "npm install" to install all dependencies.
- Copy .env.example to .env.local and fill in the fields, all necessary information is on supabase.
- run "npm run dev" to run a local copy on port 5173.

## Implemented Features

So far the following features have basic implementations, while they are far from the finished version they serve as an example of how they will work:

- Account Creation for both instructors and students
- Course Creation
- Assignment Creation
- Course Joining for students
- File uploading / Assignment Submission
- Overview Pages for both instructors and students
- Assignment Pages for both instructors and students

## Planned Features

Please see the [progress tracker](./ProgressTracker.md) for in progress features and todos.

## Design Decisions

Here is a list of some of the most notable design decisions that have come up during the design of the front end.

- No email verification, while email verification is a very common and important part of security for a site, and something that can easily be enabled through supabase the decision to keep it turned off for this project was made to provide simpler testing (for developers) and marking (for the ta). Having to verify the email every time someone makes a new account to try a feature would be tiresome and unnecessary for a project that will not see actual use.
