# nodejs-cms

A simple content management system based on Node.js, Express.js and MongoDB/Mongoose with Handlebars for templating.

### Features
- Home page with blog posts
- Shows (newest) featured post
- Shows the most popular posts (based on comments)
- Login and registration
- Users can either be 'admin' or 'user'
- Admin is able to log into admin area
- Users can see each other's profiles
- Users can message each other
- Users can comment on posts
- Users can like posts


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
- Can feature specific posts


##### Dependencies
- [bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [connect-flash](https://www.npmjs.com/package/connect-flash)
- [express](https://www.npmjs.com/package/express)
- [express-fileupload](https://www.npmjs.com/package/express-fileupload)
- [express-handlebars](https://www.npmjs.com/package/express-handlebars)
- [express-session](https://www.npmjs.com/package/express-session)
- [handlebars](https://www.npmjs.com/package/handlebars)
- [method-override](https://www.npmjs.com/package/method-override)
- [moment](https://www.npmjs.com/package/moment)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [mongoose-url-slugs](https://www.npmjs.com/package/mongoose-url-slugs)
- [passport](https://www.npmjs.com/package/passport)
- [passport-local](https://www.npmjs.com/package/passport-local)



