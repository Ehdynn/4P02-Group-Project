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
- Submission download for instructors
- Initial implementation of comparison trigger
- View comparison info

## Planned Features

Please see the [progress tracker](./ProgressTracker.md) for in progress features and todos.

## Design Decisions

Here is a list of some of the most notable design decisions that have come up during the design of the front end.

- No email verification, while email verification is a very common and important part of security for a site, and something that can easily be enabled through supabase the decision to keep it turned off for this project was made to provide simpler testing (for developers) and marking (for the ta). Having to verify the email every time someone makes a new account to try a feature would be tiresome and unnecessary for a project that will not see actual use.
- Edge function to create the comparison table entry, instead of just using a normal db function an edge function was used in order to make triggering the comparison event on the engine easier once the engine is complete and hosted. If it was just a normal db function then the engine must actively monitor for an update to the table instead of receiving a request.

## Notes

The WIP front end is currently hosted at [https://teamwon.up.railway.app/](https://teamwon.up.railway.app/) . Due to the nature of the host [railway](https://railway.com/) and github permissions the site relies on an identical fork of the main project. However, the fork is not synced automatically so there may be a slight delay in new features showing up.
