# Introduction

In this assignment, you will get your hands dirty and make a simple Vue flashcards app. What it means to get your hands dirty has changed over the years, and in particular just within the last year -- just as graphing calculators fundamentally changed how algebra is taught.

This assignment's flashcards app is simple enough that it should be something a competent web developer should be able to write out on their own, from scratch, with no assistance. So, one of the goals of this assignment is to help get you to that point (assuming you aren't already there, as some of you might be!). 

Along the way -- as discussed during the first lecture -- you should explore in greater detail what Wittgenstein's quote means: "the limits of my language mean the limits of my world." Because, if you are clever about it, this app is also simple enough that an LLM can generate it for you, soup to nuts. The primary limiting factor is your command over the "language" to describe what is needed (after all, the second L in LLM is language).

If you have not used an LLM before, 2 good free resources are:

* ChatGPT 3.5 (https://chat.openai.com/)
* Bing Copilot (https://www.bing.com/search?q=Bing+AI&showconv=1)

> NOTE: you do not need to use an LLM to write the code for this assignment, but it is encouraged that even if you write the code entirely on your own, you should also observe how the LLM addresses the problems presented in this assignment. On the other extreme, if you want to primarily rely on the LLM, your job becomes one of checking and fixing when the LLM creates something that does not meet the requirements of the assignment. ***LLMs make "mistakes" all the time***.

# Assignment Tasks

1. Modify the starting point Vue 3 app provided in this repository to implement the design given in `DESIGN.png`. You will be graded on how closely you match this design and how well it demonstrates the aesthetic principles we've discussed in class so far. 

	a. Note that since we have not covered CSS yet, there is no expectation to match colors, borders, or specific fonts (though you can certainly try for your own edification). 

	b. Don't forget to make changes to the code as a series of incremental commits to your git repository. ***This aspect is also part of your grade.***

2. Place your JSON data file from task #1 in the `public/` subdirectory. Add entries to it so that there are at least 5 example flashcards in total. NOTE: ordinarily, we would use `fetch` to retrieve this data file, but we haven't covered promises yet, so you need to `import` it instead as demonstrated during lecture.

3. Change whatever else is needed in order to make the flashcards app "play" through all 5 example flashcards. Take a screenshot in PNG format and commit it into the root of the project directory.

4. Create a `DISCUSSION.md` file in the root of the project directory with answers to the following questions:

	a. Give one example of something the LLM got wrong in generation and what you had to do to fix it. (Again, even if you do not primarily rely on the LLM to write the code for this assignment, use it anyway in order to answer this question.)

	b. Regarding the JSON file you put into the `public/` directory in task #2, does it need to be wrapped in a `ref` for the page to refresh automatically when you edit the file? Why or why not?
