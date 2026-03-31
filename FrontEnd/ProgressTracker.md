# Progress Tracker

## MUST BE FINISHED BY April 2 @ 11:59 
- [ ] Boiler Plate Upload
- [ ] Boiler Plate RLS
- [ ] Selecting the same person again should close side by side
- [ ] Test if it goes to the right line on longer files in side by side
- [ ] Remove About page - Or add stuff to it




## Instructors Assignment Page

- [x] [TN] Run Comparison Button
- [ ] [TN] Download All Submission Button
- [ ] [TN] View Comparison Button (Update button to say view results or view "???" depending on if it is ready or pending).

## Instructor Comparison Page

- [x] [TN] Comparisons listed along the left side (1/4 ish of the screen).
- [x] [TN] Stats about the selected comparison at the top of the RHS (3/4 ish of the screen)
- [ ] [TN] Comparison Details underneath stats with student list to compare submissions (3/4 ish of the screen)
    - [ ] [TN] Modal that appears when you click on a student to see their individual comparison.
        - [ ] [TN]Highlight similar code
        - [ ] [TN]Link to the other submission it was similar to
        - [ ] [TN]Link to open in side by side view of similar assignments

## Instructor Side By Side Comparison

- [ ] [TN] Show comparison between two students submissions side by side

## Instructor Course Overview

- [x] [TN] Add the ability to remove students from the course
- [x] [TN] Allow them to update the join code
- [ ] Display more info about the course, right now the start date / end date isn't shown.

## Student Submit Modal

- [ ] Modal to submit an assignment, should first get the key then show the assignment info and allow submission.

## Convert Edge Functions to front end queries or db functions

- [x] [TN] create course
- [x] [TN] create assignment
- [x] [TN] get instructors courses
- [ ] Add student to course (db function)
- [x] [TN] create user account (db function)

## MSC

- [ ] Add an option to allow/disallow multiple submissions to assignments when creating an assignment
- [ ] Add Toasts
- [ ] [L] Email confirmation of submission?
- [ ] [L] Fill out the landing page
- [ ] Add a footer
- [ ] Form persistence in order to fully secure pages without losing form data on browser tab switching. Current version may result in the form being shown briefly while the users status is verified. However, since no information is present on the forms until the user is authenticated anyways this is more of a cosmetic thing than a security thing.
- [ ] Update error msgs to be more user friendly once testing is done
- [ ] Create a spinning wheel for loading and add it to pages
- [ ] Fix reload issue
- [ ] Better assignment not found page
- [ ] add a way to trigger a the comparison engine inside the create comparison edge function once the engine is complete.
- [ ] Create demo accounts

### Completed

- [x] [TN] Log user in after creating account
- [x] [L] [TN] Implement Forgot Password
- [x] [TN] Add a timezone for the assignment due date
- [x] [TN] Update page not found page
- [x] [TN] Redirect to overview on successful creation of a course
- [x] [TN] Turn the join a course button from a page to a modal
- [x] [TN] Due dates should have a time not just a date
- [x] [TN] Create assignment should redirect to the assignment page
- [x] [TN] Stop students from submitting after the due date, or add an option for the instructor to allow submissions after the due date.
- [x] [L] Restrict file types for upload
- [x] [TN] Move the course update div to its own component and own hook files.
- [x] Add due dates to courses on overview
