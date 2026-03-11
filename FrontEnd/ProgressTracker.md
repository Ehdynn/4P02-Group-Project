# Progress Tracker

## Instructors Assignment Page

- [ ] Track the % of the class who has submitted
<<<<<<< Updated upstream
- [ ] [TN] Run Comparison Button (Button in place, no effect) 
- [ ] [TN] Download All Submission Button
- [ ] [TN] View Comparison Button (Button in place, no effect)
=======
- [ ] Run Comparison Button
- [ ] [TN] Download All Submission Button (Add options like only downloading the latest submission for each student vs all submissions made)
- [ ] View Comparison Button
>>>>>>> Stashed changes

## Instructor Comparison Page

- [ ] [L]List submissions along left side, click on submission to show it
- [ ] [L]Comparision overview with things like % similar etc on the top of the RHS (2/3 of the screen)
- [ ] [L]View Submission Box on the bottom of the RHS (2/3 of the screen)
    - [ ] [L]Highlight similar code
    - [ ] [L]Link to the other submission it was similar to
- [ ] [L]Link to open in side by side view of similar assignments 

## Instructor Course Overview
- [x] [TN] Add a class list - Currently uses a database function, since their names are only stored in the auth.users table it had to use the definer security level, might be worth considering if using an edge function is better, or if the Accounts table should hold their name as well to avoid this whole issue.
- [x] [TN] Add the ability to remove students from the course
- [x] [TN] Allow them to update the join code
- [ ] Display more info about the course, right now the start date / end date isn't shown.

## Students Assignment Page

- [x] [TN] Improve the look
- [ ] Button to view comparison

## Student Comparison Page

## Convert Edge Functions to front end queries or db functions

- [x] [TN] create course
- [x] [TN] create assignment
- [x] [TN] get instructors courses
- [ ] Add student to course (db function)
- [ ] create user account (db function)

## MSC

- [x] [TN] Add a timezone for the assignment due date
- [ ] Add an option to allow/disallow multiple submissions to assignments when creating an assignment
- [x] Redirect to overview on successful creation of a course
- [x] Turn the join a course button from a page to a modal
- [ ] Add Toasts
- [ ] [L] Email confirmation of submission?
- [x] [L] [TN] Implement Forgot Password
- [ ] [L] Fill out the landing page
- [ ] Add a footer
- [x] [TN] Log user in after creating account
- [x] [TN] Update page not found page
- [ ] Form persistence in order to fully secure pages without losing form data on browser tab switching. Current version may result in the form being shown briefly while the users status is verified. However, since no information is present on the forms until the user is authenticated anyways this is more of a cosmetic thing than a security thing.
- [ ] Update error msgs to be more user friendly once testing is done
- [ ] Create a spinning wheel for loading and add it to pages
- [ ] Fix reload issue
- [x] [TN] Due dates should have a time not just a date
- [ ] Fix error msg when student tries to enroll in the same course twice, also suppress the console error
- [x] [TN] Create assignment should redirect to the assignment page
- [x] [TN] Stop students from submitting after the due date, or add an option for the instructor to allow submissions after the due date.
- [x] [L] Restrict file types for upload
- [ ] Better assignment not found page
- [x] [TN] Move the course update div to its own component and own hook files.
- [ ] Add due dates to courses on overview
