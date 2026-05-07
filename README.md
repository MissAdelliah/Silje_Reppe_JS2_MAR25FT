# Silje_Reppe_JS2_MAR25FT
This will be a social media extention of GitHub called Comits
# Comit
Comit is a front-end social media application built for the JavaScript 2 Course Assignment. 
-The app uses the Noroff Social API and allows users to register, log in, view posts, create posts, edit/delete their own posts, search, filter by tags, view profiles, and follow/unfollow other users.

### Live site
(https://missadelliah.github.io/Silje_Reppe_JS2_MAR25FT/ )

### Built with

- HTML5
- CSS3
- JavaScript
- ES6 modules
- Noroff API v2
- Some JSDoc

No front-end frameworks were used.

## CRUD functionality 
### Structure
.
├── account/
│   ├── login.html
│   ├── register.html
│   └── profile.html
├── post/
│   ├── index.html
│   ├── single.html
│   ├── create.html
│   └── edit.html
├── css/
│   └── style.css
├── js/
│   ├── api.js
│   ├── utils.js
│   ├── login.js
│   ├── register.js
│   ├── index.js
│   ├── single.js
│   ├── create.js
│   ├── edit.js
│   └── profile.js
├── icons/
├── images/
├── index.html
└── README.md

### Features

- Register a new user
- Log in as a registered user
- Store logged-in user data in `localStorage`
- View all social posts in the feed
- View a single post by clicking a post card
- Create a new post
- Edit own posts
- Delete own posts
- View own profile
- View other users’ profiles
- View posts from another user
- Follow and unfollow other users
- Search posts
- Search profiles
- Filter posts by tags
- View posts from followed users
- Basic responsive UI styling

## API

This project uses the Noroff API v2:

```txt
https://v2.api.noroff.dev
