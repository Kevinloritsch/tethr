# CS180 - Tethr Final Project Report
#### Ignite: Kevin Loritsch, Stanley Lew, Charleen Chen, Quin Gill

**Link to codebase**: https://github.com/Kevinloritsch/tethr

**Summary**: Tethr is a social accountability app designed to help people stay consistent with their habits while staying connected. Tethr is a mobile app built with Expo, React Native, TypeScript, Nativewind, and Supabase, tested with Jest, and hosted on GitHub.

## Written Report
### How to build and run our project locally
1. Ensure git is installed (https://git-scm.com/install/)
2. Clone the repository
3. Ensure node is installed (https://nodejs.org/en/download)
4. Add the following .env keys to the root directory of the repository:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

5. Run `npm i` to install packages
6. Download the Expo Go app on your mobile device. Proceeding anonymously should be fine
7. Run the command `npm run start`(if this doesn’t work, use `npx expo start`)
8. Scan the generated QR Code with your mobile device camera; the app should be opened in Expo Go automatically, and should appear
9. To run tests, run `npm run test`(if this doesn’t work, use `npx jest` it is normal for the first and sometimes second run of tests to take upwards of 1 minute and fail, but subsequent runs will pass.)

### Project Description
Tethr is a social accountability app designed to help people stay consistent with their habits while staying connected with the people around them. Many people struggle to motivate themselves to maintain routines, whether they’re working out, attending classes, or completing daily tasks. Furthermore, in a world where everyone is busy, it’s easy to drift apart from friends and lose any sense of shared experiences. Tethr solves both challenges by “tethering” groups of friends together around shared daily goals. Each group commits to the same task and checks in with a photo proving they completed it. At its core, Tethr helps people build better habits and stronger relationships.

### Report Questions
#### Implemented Features and Cuts 
*Q*: Have you completed the major functionality and features listed in your original proposal? If not, why not?

*A*: We completed all major functionality except for streaks from our original proposal. When weighing the importance of streaks compared to other features, we chose to remove the streaks feature in favor of implementing observers and polishing the existing features. This also allowed us to not need to work streaks into our existing database model, as we began to notice the limitations of the Supabase free plan, especially when trying to store photos, and did not feel like it was worth the cost of adding an additional table to our database.

*Q*: Did you add any additional features that were not listed in the proposal?

*A*: 
- We initially planned to store a hashed user password, but instead chose to create a DFA system for logins and signups. Using Supabase authentication, we were able to create a more secure login system which avoids the need for passwords entirely, creating a cleaner user experience.
- Our initial proposal had no way to view, add, or remove friends. We solved this by adding an additional friends page, to cleanly and easily store this information and highlight these functionalities.
- We also wanted to add an additional screen to represent the user’s profile information, including a way for them to update their username / name, see global stats based on their time in the app, and display a place for them to easily logout or delete their account. We handled this by adding a profile page to the app.

*Q*: What features did you cut to help you complete the project in time, and why did you choose these to be cut?

*A*: 
- As mentioned earlier, we cut a streak management system, choosing instead to give each user a score based on the number of tasks which they had completed. This was an easy change to implement, not requiring any frontend design changes, but allowed us to save a lot of time, as well as minimize data storage, where we need to store a separate streak for each task, per user, handling weekly and daily logic separately to create a single global score.
- When working on our design, we planned to allow each user to upload a custom profile photo. Though our database is almost exactly set up to handle this, we chose to not implement the feature, allowing us to allocate more space to saving photos taken from completing tasks, rather than needing to store profile photos in addition.

*Q*: How much work do you estimate you saved by cutting these features?

*A*: We believe that by cutting these features, we were able to instead allocate our time towards the additional pages outside of our original proposal, as well as to focus more time on building out a well-fleshed Observer Model, and clean up the UI throughout the app, creating a nice user experience.

#### Improvement
*Q*: What ended up being your team members' current roles?

*A*:
Charleen Chen - Designer, Software Developer
Quin Gill - Software Developer, Test Engineer
Stanley Lew - Software Developer
Kevin Loritsch - Designer, Software Developer, Scrummaster

*Q*: What occupied the majority of each team member's time and workload?

*A*: 
- Charleen Chen - Authentication for signup using Supabase and UI for home pages
- Quin Gill - Primarily Friends list features, Profile features, and testing, wrote the core functionality for both friends and profile and all tests.
- Stanley Lew - Debugging; namely RLS permissions within Supabase because of interlinked permissions between different Supabase tables for groups, tasks, ispartof, etc. | Other than that probably working with connecting user x group x task functionality
- Kevin Loritsch - Worked on the primary camera and task completion logic, and implemented the observer design pattern. Also handled various frontend components throughout.

*Q*: How does this differ from your original expectations and specs?

*A*: Our app is ultimately very similar to our original expectations and specs. Outside of the changes listed above, our main differences are in the database structure and relations which were changed to optimize queries and cut unnecessary information to save storage, such as not needing to store any form of user password in our database. We also changed to use Supabase’s storage feature to hold our images, rather than having links to them directly in our tables.

*Q*: Where did you spend too much/little time, and why?

*A*: We likely spent too much time perfecting existing features to the miniscule detail when we could have focused on adding more features, as a result of a perfectionist mindset. We often spent significant time fixing the UI to look perfect on a variety of screens, or would get stuck trying to resolve a complex edge case.

### Test report
Link to test cases: <https://github.com/Kevinloritsch/tethr/tree/dev/src/__test__>

#### Overview
For testing we used Jest and the React Native Testing library for unit and integration testing. In these tests we frequently use Mocks and we collect test coverage using Jest’s built in coverage feature. We also added our tests to our GitHub Actions workflow for regression testing. We had over 500 tests and to write a description for all of them would be verbose and unnecessary, so instead we will categorize the types of tests used and our methodology for these tests.
#### Tools, Scripts, commands, system configurations
**Tools**:
- Jest(unit testing, integration testing, mocks, coverage)
- React Native Testing Library(allows for testing react native components)
- GitHub Actions(regression testing)

**Scripts**:
- checks.yml: runs the test suite on pull request(along with formatting, linting, and type checking scripts)

**Commands**:
- `npm test` runs the test suite and generates code coverage files

**System Configurations and Files(these are all included when cloning the repo and using `npm i` and running the tests once should set this up for you automatically)**
- package.json: contains the jest config, including presets, mocked modules, coverage configuration, etc.
- jest.setup.js: includes imports and mocks for large packages
- babel.config.js: presets and plugins for babel(required to use jest)
- \_\_mocks\_\_ folder: includes mocks for larger packages used in tests, there is also a mocks folder in the src folder which holds a mock for the task completion observer

#### How to run tests
Instructions to set up our repo and run the app locally are listed above, do not try to run the tests before setting up the project. After project setup is complete, run `npm test` or `npx jest` to run our test suites. Usually the first run of the testing library on a new device will result in at least one test failing and take over 1 minute(the first run needs to read the jest setup file and set up mocks, which lead to timeouts), but subsequent test runs will pass.
#### Test Cases and Methodology
Our focus for testing was to reach at least 80% coverage on core modules (controllers and components), and reach at least 70% overall coverage. We used both whitebox and blackbox testing practices and focused primarily on unit tests, as well as some integration testing. We also wanted to integrate testing into our CI workflow for regression testing.
Test case categories

**Unit tests**
- *UI component testing*: we used jest’s `describe`, `it()`, and `expect()` functions as well as RNTL’s `render()`, `screen.getByText()` and `fireEvent.press()` to test the proper loading and rendering of components, as well as correct behavior when buttons are pressed. We used mocks here to simulate interactions between other modules(for example when a button press calls expo-router, we mock expo-router)
- *Features testing*: we use `jest.fn()` `beforeEach()`, etc. from jest as well as RNTL fireEvent, waitFor, and Screen functions to test feature functionality for things like login, group functionality, etc. and use mocks for controller modules to simulate async updates using `act()`
- *Business Logic Tests*: we use Jest Mocks to simulate Supabase using `mockResolvedValue()`, and `mockRejectedValue()`, to mock Supabase API responses, then use expects to ensure our controllers were returning properly formatted and typed data
- *Observer Model Tests*: we use expects for calls to verify callback invocation from our mock listeners, making sure the Observers work as intended
- *Utility Testing & library testing*: used jest describe and expect functions to test our utilities and mocks to ensure our Supabase config was initialized correctly

**Integration Tests**: we tested integration for screens and multi-feature user flows that rely on data from multiple sources, work across multiple screens, and require multiple controllers, using Mocks, event firing, and act functions to ensure the Views are calling the correct controllers, rendering their components properly, and that the expected flow between screens occurs

#### Testing Results
We had over 50 test suites and over 500 individual test cases, which all passed. We reached over 80% code coverage on folders with the most important modules and over 70% coverage overall. Including results for all 508 individual tests would be verbose and unnecessary, but to see these results as well as full code coverage data you can run them locally.

![testing results](/src//assets//readmeimages/Screenshot%202025-12-02%20124623.png)

![controller coverage](/src//assets//readmeimages/controllercov.png)
![components coverage](/src//assets//readmeimages/componentscov.png)
![overall coverage](/src//assets//readmeimages/fullcov.png)


