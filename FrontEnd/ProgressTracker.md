# Progress Tracker

## Instructors Assignment Page

- [ ] Track the % of the class who has submitted
- [ ] Run Comparison Button
- [ ] Download All Submission Button
- [ ] View Comparison Button

## Instructor Comparison Page

- [ ] View a user submission
- [ ] Show were it was similar to other submissions
- [ ] Link to the other submission it was similar to
- [ ] Possibly show a side by side of the two assignments

## Instructor Course Overview

- [x] Add a class list - Currently uses a database function, since their names are only stored in the auth.users table it had to use the definer security level, might be worth considering if using an edge function is better, or if the Accounts table should hold their name as well to avoid this whole issue.
- [x] Add the ability to remove students from the course
- [ ] Allow them to update things like the join code

## Students Assignment Page

- [x] Improve the look
- [ ] Button to view comparison

## Student Comparison Page

## Convert Edge Functions to front end queries

- [x] create course
- [x] create assignment
- [x] get instructors courses
- [ ] Add student to course
- [ ] create user account

## MSC

- [x] Add a timezone for the assignment due date
- [ ] Add an option to allow/disallow multiple submissions to assignments when creating an assignment
- [x] Redirect to overview on successful creation of a course
- [x] Turn the join a course button from a page to a modal
- [ ] Add Toasts
- [ ] [L] Email confirmation of submission?
- [ ] [L] Implement Forgot Password
- [ ] [L] Fill out the landing page
- [ ] Add a footer
- [x] Log user in after creating account
- [x] Update page not found page
- [ ] Form persistence in order to fully secure pages without losing form data on browser tab switching. Current version may result in the form being shown briefly while the users status is verified. However, since no information is present on the forms until the user is authenticated anyways this is more of a cosmetic thing than a security thing.
- [ ] Update error msgs to be more user friendly once testing is done
- [ ] Create a spinning wheel for loading and add it to pages
- [ ] Fix reload issue
- [ ] Due dates should have a time not just a date
- [ ] Fix error msg when student tries to enroll in the same course twice, also suppress the console error
- [x] Create assignment should redirect to the assignment page
- [ ] Stop students from submitting after the due date, or add an option for the instructor to allow submissions after the due date
- [ ] Restrict file types for upload
