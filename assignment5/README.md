# Introduction

In this assignment, you are going to improve the user experience of the Smoothie Stand example.

# Assignment Tasks

1. Pull the latest examples repo and copy the `ui/` and `server/` subdirectories of the `lecture13-smoothie-stand/` directory into your assignment directory, *EXCEPT* do not overwrite the `server/data.ts` currently in your repository. Commit and push this before proceeding to the next step. 

2. In `server/setupMongo.ts` there is code to create default customers and operators. Add code to create at least 10 default possible ingredient choices and put them into a MongoDB collection called `possibleIngredients`. For the `_id`s of the ingredients you define, use A, B, C, etc.

3. The original example code had a `possibleIngredients` variable exported from `server/data.ts`. Change code dependent on the `possibleIngredients` variable to instead get the possible ingredients from MongoDB.

4. The original example code was dependent on there being an `ingredients` array field in order objects. Change all relevant code in `server/` to use the new `ingredientIds` array field instead. 

5. Similar to step 4, change the relevant code in `ui/` -- but in the process, make the following changes: (a) show a comma-separated list of ingredient names, not the raw `ingredientIds`, on both the operator and customer screens by using an explicit `:fields` prop and the `formatter` feature (see https://bootstrap-vue.org/docs/components/table#formatter-callback); (b) instead of checkboxes, show a list of "Add X" buttons for each ingredient X; (c) show a list of already added ingredients with delete buttons (hint: use `splice` to delete); (d) also show the total cost for the draft order -- the implementation for adding up the total *must use `reduce`*. NOTE: the implication of this is that ingredient IDs can be duplicated, so if, for example, the ID for strawberries is on the list 3 times, then someone has ordered a triple order of strawberries.

6. Add a reverse proxy to the `vite.config.ts` to allow connections to Ollama, as was done in `lecture15-llm-chat`.

7. Create a chatbot Vue component. You should feel free to make use of the `lecture15-llm-chat` example code. Whether you decide to use the example code as is or not, you need to at least make sure that LLM output is streamed onto the screen (i.e., do not wait for the entire chat response to be formulated before being rendered at once). It also needs to communicate with Ollama via the reverse proxy route from step 6. Note that the chat does *not* need to be saved anywhere permanent; if the user refreshes the browser, the chat can start over from scratch.

8. Embed the chatbot component into the `CustomerScreen`, in the Draft Orders section. Update the chatbot component to take a prop with an array of possible ingredients. Anywhere in the chat listing, if these ingredients appear, they need to be made clickable and formatted in a way distinct from the other text (so that it is obvious from the demo video). (Hint: convert the chat message into an array of words and render this array with `<span v-for>`.) If a user clicks on an ingredient, an event needs to be fired back to the `CustomerScreen` and that ingredient needs to be added to the draft order (if it isn't already part of the order).

9. Create a single E2E test in the `tests/` subdirectory that demonstrates creating an order with just one fixed hardcoded ingredient of your choice. *Do not put the name of an ingredient or ingredient ID into your test code.* Your test needs to validate that, after navigating to the operator page, the order shows up with the one ingredient you chose. Your test also needs to work even if there are multiple orders in the queue on the operator page. Hint: use `tr:last-child` (you can assume the orders will be sorted in chronological order by default).

10. Use Panopto to make a short demo video to share with the instructor and the 3 course TAs prior to the due date. The video needs to include: (a) one end-to-end scenario of a customer ordering a smoothie with ingredients that come from the chat session and an operator fulfilling the order; (b) the running of the E2E test *not in headless mode* so that the execution can be seen in the video. 