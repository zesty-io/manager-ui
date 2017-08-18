# Site Manager Application

Site Manager is comprised of several sub applications

## Architecture

### Dependencies
All sub bundle build dependencies are lifted to the top level `package.json`. This creates a single location to manager dependency versions. As well as a top level resolution for all sub directory dependency needs.
