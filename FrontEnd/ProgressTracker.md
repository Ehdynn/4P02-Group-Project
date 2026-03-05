# Instructors Assingment Page
- [ ] Track the % of the class who has submitted
- [ ] Run Comparison Button
- [ ] Download All Submission Button
- [ ] View Comparison Button

# Instructor Comparison Page

# Instructor Course Overview
- [ ] Add a class list - Currently uses a database function, since their names are only stored in the auth.users table it had to use the definer secuirity level, might be worth considering if using an edge function is better, or if the Accounts table should hold their name as well to avoid this whole issue.
- [ ] Add the ability to remove students from the course
- [ ] Allow them to update things like the join code

# Students Assignment Page
- [ ] Improve the look
- [ ] Button to view comparison

# Student Comparison Page

# Convert Edge Functions to front end querries
- [ ] create course (Might have to stay as an edge function, due to current rls rules, revisit later, since the edge function is still functional)
- [ ] create assignment (Created but not tested)
- [x] get instructors courses

# MSC
- [ ] Add a timezone for the assingment due date
- [ ] Add an option to allow/disallow multiple submissions to assignments when creating an assignment
- [ ] Redirect to overview on successfull creation of a course
- [ ] Turn the join a course button from a page to a modal
- [ ] Add Toasts
- [ ] Email confirmation of submission?
- [ ] Implement Forgot Password
- [ ] Fill out the landing page
- [ ] Fill out the about us page
- [ ] Add a footer
- [ ] Log user in after creating account
- [ ] Update page not found page
- [ ] Form persistence in order to fully secure pages without losing form data on browser tab switching. Current version may result in the form being shown briefly while the usersstatus is verified. However, since no information is present on the forms until the user is authenticated anyways this is more of a cosmetic thing than a security thing.
- [ ] Update error msgs to be more user friendly once testing is done