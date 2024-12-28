# a
I let ChatGPT generate the whole project directly. The first version of the code did almost everything, but it had the JSON file in the wrong place. Also, it added some CSS that didn't work. I fixed it by removing the unnecessary code. After that I just made a few changes to this version of the code, such as adding the auto-refresh feature.

# b
The hot reloading feature provided by Vue's development server watches for changes in imported files. If a JSON file is imported  in a Vue component, the development server treats it as a module dependency. This means that during development, when an imported JSON file is changed, the server detects the changes and refreshes the module. This triggers a refresh of the Vue component that depends on that module, updating the data displayed in the application. As a result, the JSON file does not need to be wrapped in a `ref` for the page to refresh automatically.
