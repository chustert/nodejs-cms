# nodejs-cms

A simple content management system based in Node.js

### Features
- Home page with blog posts
- Login and registration
- Users can either be 'admin' or 'user'
- Admin is able to log into admin area
- Users can see each other's profiles
- Users can message each other

#### Account
Each user has their own account with:
- Dashboard (Some account details and chart with amount of posts and comments)
- Profile (which can be edited)
- View, edit, create, delete posts
- View and delete comments (also see which comments still need to be allowed by the admin)
- Messages: View all messages that were sent between the logged in user and other users


#### Admin Area:
- Dashboard with chart (amount of total posts, total categories, totoal comments)
- Can see all posts from all users; can view, edit and delete them
- Can create, edit and delete categories
- Can see all comments from all users; can view, allow and delete them
- Can see, edit and delete all profiles of all users
