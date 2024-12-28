# Introduction

In this assignment, you are going to retrofit the signup list example from lecture 8 to use a Vue router so that you can support a view for external users signing up for activities and an internal-only view for managing lists and approving signups. 

The use case scenario is as follows: someone (the internal activity admin) running an activity wants to be able to give out a URL to potential participants (i.e., external end users) to use to sign up. At the same time, the person running the activity needs to maintain control over who will participate. This is achieved by giving the internal admin exclusive control over a boolean field that can be set when the admin has reviewed and approved of individual potential participants. Your goal with this assignment is to enable this use case scenario.

NOTE: logically, the two views (as well as the APIs) should be guarded by a user ID and password system, but we won't cover this subject until later in the course, so the views in this assignment should be unguarded. Just assume that external users are somehow blocked from accessing the internal view and calling APIs other than those used by the external end user view.

# Assignment Tasks

1. Pull the latest examples repo and copy the `ui/` and `server/` subdirectories of the `lecture08-signup-list/` directory into your assignment directory. Commit and push this before proceeding to the next step.

2. Based on the lecture 9 example, convert the UI project to having a Vue router. You will need to end up with 2 different views, `Admin.vue` and `EndUser.vue`, connected to the router at paths `/admin` and `/list/:listId`, respectively.

3. `Admin.vue` should closely resemble the original `App.vue`. However, in addition to `name`, you need to add a boolean field called `reviewed`. This should be wired to a checkbox. When the checkbox gets selected/deselected, a `PUT /api/list/<list ID>/participant/<participant ID>` API call should be made to the backend server.

4. As a client-side "lock" to prevent double submissions, add a `b-overlay` (see https://bootstrap-vue.org/docs/components/overlay) to obscure the view whenever an API call is in progress.

5. `EndUser.vue` needs to expose a more limited UI. This view should work off the list identified via the `:listId` route parameter. Some of the code can be based on the original `App.vue` as well, but the original left hand side showing the list of the lists needs to be removed. This view should also render whether names on the list have been approved or not, but this view should not allow approval status to be changed. Add a `b-overlay` to this view as well as was done in step 4.

6. Make a short demo video demonstrating all of the above features (no more than 2 minutes). Use Panopto and share the video with the instructor and the 3 course TAs prior to the due date.
