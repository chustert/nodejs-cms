# Details

Date : 2022-12-06 15:15:28

Directory /Users/christianhustert/Desktop/NodeJS-CMS/nodejs-cms

Total : 112 files,  43254 codes, 4049 comments, 6307 blanks, all 53610 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 1 | 0 | 0 | 1 |
| [app.js](/app.js) | JavaScript | 60 | 10 | 15 | 85 |
| [config/database.js](/config/database.js) | JavaScript | 5 | 0 | 0 | 5 |
| [config/dev-database.js](/config/dev-database.js) | JavaScript | 3 | 0 | 2 | 5 |
| [config/prod-database.js](/config/prod-database.js) | JavaScript | 3 | 0 | 2 | 5 |
| [helpers/admin-authentication.js](/helpers/admin-authentication.js) | JavaScript | 11 | 0 | 0 | 11 |
| [helpers/authentication.js](/helpers/authentication.js) | JavaScript | 8 | 0 | 1 | 9 |
| [helpers/handlebars-helpers.js](/helpers/handlebars-helpers.js) | JavaScript | 44 | 1 | 12 | 57 |
| [helpers/role-authentication.js](/helpers/role-authentication.js) | JavaScript | 8 | 0 | 1 | 9 |
| [helpers/upload-helper.js](/helpers/upload-helper.js) | JavaScript | 12 | 0 | 2 | 14 |
| [models/Category.js](/models/Category.js) | JavaScript | 9 | 0 | 2 | 11 |
| [models/Comment.js](/models/Comment.js) | JavaScript | 25 | 0 | 2 | 27 |
| [models/Message.js](/models/Message.js) | JavaScript | 21 | 0 | 2 | 23 |
| [models/Post.js](/models/Post.js) | JavaScript | 45 | 0 | 3 | 48 |
| [models/User.js](/models/User.js) | JavaScript | 41 | 1 | 2 | 44 |
| [package-lock.json](/package-lock.json) | JSON | 2,263 | 0 | 1 | 2,264 |
| [package.json](/package.json) | JSON | 29 | 0 | 1 | 30 |
| [public/css/blog-home.css](/public/css/blog-home.css) | CSS | 8 | 5 | 3 | 16 |
| [public/css/blog-post.css](/public/css/blog-post.css) | CSS | 8 | 5 | 3 | 16 |
| [public/css/bootstrap-switch.min.css](/public/css/bootstrap-switch.min.css) | CSS | 1 | 8 | 1 | 10 |
| [public/css/bootstrap.min.css](/public/css/bootstrap.min.css) | CSS | 7,361 | 7 | 1,006 | 8,374 |
| [public/css/font-awesome/css/font-awesome.css](/public/css/font-awesome/css/font-awesome.css) | CSS | 2,327 | 10 | 1 | 2,338 |
| [public/css/font-awesome/css/font-awesome.min.css](/public/css/font-awesome/css/font-awesome.min.css) | CSS | 1 | 3 | 1 | 5 |
| [public/css/font-awesome/fonts/fontawesome-webfont.svg](/public/css/font-awesome/fonts/fontawesome-webfont.svg) | XML | 2,671 | 0 | 1 | 2,672 |
| [public/css/font-awesome/less/animated.less](/public/css/font-awesome/less/animated.less) | Less | 28 | 2 | 5 | 35 |
| [public/css/font-awesome/less/bordered-pulled.less](/public/css/font-awesome/less/bordered-pulled.less) | Less | 17 | 3 | 6 | 26 |
| [public/css/font-awesome/less/core.less](/public/css/font-awesome/less/core.less) | Less | 8 | 2 | 3 | 13 |
| [public/css/font-awesome/less/fixed-width.less](/public/css/font-awesome/less/fixed-width.less) | Less | 4 | 2 | 1 | 7 |
| [public/css/font-awesome/less/font-awesome.less](/public/css/font-awesome/less/font-awesome.less) | Less | 13 | 4 | 2 | 19 |
| [public/css/font-awesome/less/icons.less](/public/css/font-awesome/less/icons.less) | Less | 786 | 2 | 2 | 790 |
| [public/css/font-awesome/less/larger.less](/public/css/font-awesome/less/larger.less) | Less | 9 | 3 | 2 | 14 |
| [public/css/font-awesome/less/list.less](/public/css/font-awesome/less/list.less) | Less | 16 | 2 | 2 | 20 |
| [public/css/font-awesome/less/mixins.less](/public/css/font-awesome/less/mixins.less) | Less | 41 | 10 | 10 | 61 |
| [public/css/font-awesome/less/path.less](/public/css/font-awesome/less/path.less) | Less | 11 | 3 | 2 | 16 |
| [public/css/font-awesome/less/rotated-flipped.less](/public/css/font-awesome/less/rotated-flipped.less) | Less | 12 | 4 | 5 | 21 |
| [public/css/font-awesome/less/screen-reader.less](/public/css/font-awesome/less/screen-reader.less) | Less | 2 | 2 | 2 | 6 |
| [public/css/font-awesome/less/stacked.less](/public/css/font-awesome/less/stacked.less) | Less | 17 | 2 | 2 | 21 |
| [public/css/font-awesome/less/variables.less](/public/css/font-awesome/less/variables.less) | Less | 794 | 3 | 4 | 801 |
| [public/css/font-awesome/scss/_animated.scss](/public/css/font-awesome/scss/_animated.scss) | SCSS | 28 | 2 | 5 | 35 |
| [public/css/font-awesome/scss/_bordered-pulled.scss](/public/css/font-awesome/scss/_bordered-pulled.scss) | SCSS | 17 | 3 | 6 | 26 |
| [public/css/font-awesome/scss/_core.scss](/public/css/font-awesome/scss/_core.scss) | SCSS | 8 | 2 | 3 | 13 |
| [public/css/font-awesome/scss/_fixed-width.scss](/public/css/font-awesome/scss/_fixed-width.scss) | SCSS | 4 | 2 | 1 | 7 |
| [public/css/font-awesome/scss/_icons.scss](/public/css/font-awesome/scss/_icons.scss) | SCSS | 786 | 2 | 2 | 790 |
| [public/css/font-awesome/scss/_larger.scss](/public/css/font-awesome/scss/_larger.scss) | SCSS | 9 | 3 | 2 | 14 |
| [public/css/font-awesome/scss/_list.scss](/public/css/font-awesome/scss/_list.scss) | SCSS | 16 | 2 | 2 | 20 |
| [public/css/font-awesome/scss/_mixins.scss](/public/css/font-awesome/scss/_mixins.scss) | SCSS | 41 | 10 | 10 | 61 |
| [public/css/font-awesome/scss/_path.scss](/public/css/font-awesome/scss/_path.scss) | SCSS | 11 | 3 | 2 | 16 |
| [public/css/font-awesome/scss/_rotated-flipped.scss](/public/css/font-awesome/scss/_rotated-flipped.scss) | SCSS | 12 | 4 | 5 | 21 |
| [public/css/font-awesome/scss/_screen-reader.scss](/public/css/font-awesome/scss/_screen-reader.scss) | SCSS | 2 | 2 | 2 | 6 |
| [public/css/font-awesome/scss/_stacked.scss](/public/css/font-awesome/scss/_stacked.scss) | SCSS | 17 | 2 | 2 | 21 |
| [public/css/font-awesome/scss/_variables.scss](/public/css/font-awesome/scss/_variables.scss) | SCSS | 794 | 3 | 4 | 801 |
| [public/css/font-awesome/scss/font-awesome.scss](/public/css/font-awesome/scss/font-awesome.scss) | SCSS | 13 | 4 | 2 | 19 |
| [public/css/sb-admin.css](/public/css/sb-admin.css) | CSS | 297 | 5 | 45 | 347 |
| [public/css/styles.css](/public/css/styles.css) | CSS | 12 | 0 | 2 | 14 |
| [public/js/admin/bootstrap-switch.min.js](/public/js/admin/bootstrap-switch.min.js) | JavaScript | 1 | 8 | 2 | 11 |
| [public/js/admin/sb-admin.min.js](/public/js/admin/sb-admin.min.js) | JavaScript | 1 | 5 | 0 | 6 |
| [public/js/bootstrap/css/bootstrap-grid.css](/public/js/bootstrap/css/bootstrap-grid.css) | CSS | 1,473 | 7 | 87 | 1,567 |
| [public/js/bootstrap/css/bootstrap-grid.min.css](/public/js/bootstrap/css/bootstrap-grid.min.css) | CSS | 1 | 6 | 0 | 7 |
| [public/js/bootstrap/css/bootstrap-reboot.css](/public/js/bootstrap/css/bootstrap-reboot.css) | CSS | 277 | 8 | 57 | 342 |
| [public/js/bootstrap/css/bootstrap-reboot.min.css](/public/js/bootstrap/css/bootstrap-reboot.min.css) | CSS | 1 | 7 | 0 | 8 |
| [public/js/bootstrap/css/bootstrap.css](/public/js/bootstrap/css/bootstrap.css) | CSS | 7,361 | 7 | 1,006 | 8,374 |
| [public/js/bootstrap/css/bootstrap.min.css](/public/js/bootstrap/css/bootstrap.min.css) | CSS | 1 | 6 | 0 | 7 |
| [public/js/bootstrap/js/bootstrap.bundle.js](/public/js/bootstrap/js/bootstrap.bundle.js) | JavaScript | 3,916 | 1,337 | 1,035 | 6,288 |
| [public/js/bootstrap/js/bootstrap.bundle.min.js](/public/js/bootstrap/js/bootstrap.bundle.min.js) | JavaScript | 1 | 6 | 0 | 7 |
| [public/js/bootstrap/js/bootstrap.js](/public/js/bootstrap/js/bootstrap.js) | JavaScript | 2,769 | 344 | 738 | 3,851 |
| [public/js/bootstrap/js/bootstrap.min.js](/public/js/bootstrap/js/bootstrap.min.js) | JavaScript | 1 | 6 | 0 | 7 |
| [public/js/jquery-easing/jquery.easing.compatibility.js](/public/js/jquery-easing/jquery.easing.compatibility.js) | JavaScript | 49 | 9 | 2 | 60 |
| [public/js/jquery-easing/jquery.easing.js](/public/js/jquery-easing/jquery.easing.js) | JavaScript | 151 | 9 | 7 | 167 |
| [public/js/jquery-easing/jquery.easing.min.js](/public/js/jquery-easing/jquery.easing.min.js) | JavaScript | 1 | 0 | 0 | 1 |
| [public/js/jquery/jquery.js](/public/js/jquery/jquery.js) | JavaScript | 6,624 | 1,697 | 1,933 | 10,254 |
| [public/js/jquery/jquery.min.js](/public/js/jquery/jquery.min.js) | JavaScript | 3 | 1 | 1 | 5 |
| [routes/admin/categories.js](/routes/admin/categories.js) | JavaScript | 7 | 61 | 1 | 69 |
| [routes/admin/comments.js](/routes/admin/comments.js) | JavaScript | 8 | 30 | 1 | 39 |
| [routes/admin/index.js](/routes/admin/index.js) | JavaScript | 9 | 43 | 1 | 53 |
| [routes/admin/posts.js](/routes/admin/posts.js) | JavaScript | 10 | 76 | 1 | 87 |
| [routes/admin/users.js](/routes/admin/users.js) | JavaScript | 12 | 108 | 1 | 121 |
| [routes/home/index.js](/routes/home/index.js) | JavaScript | 481 | 17 | 83 | 581 |
| [views/admin/categories/edit.handlebars](/views/admin/categories/edit.handlebars) | Handlebars | 13 | 0 | 1 | 14 |
| [views/admin/categories/index.handlebars](/views/admin/categories/index.handlebars) | Handlebars | 39 | 0 | 2 | 41 |
| [views/admin/comments/index.handlebars](/views/admin/comments/index.handlebars) | Handlebars | 31 | 0 | 4 | 35 |
| [views/admin/index.handlebars](/views/admin/index.handlebars) | Handlebars | 4 | 6 | 2 | 12 |
| [views/admin/posts/edit.handlebars](/views/admin/posts/edit.handlebars) | Handlebars | 42 | 0 | 1 | 43 |
| [views/admin/posts/index.handlebars](/views/admin/posts/index.handlebars) | Handlebars | 39 | 0 | 3 | 42 |
| [views/admin/users/edit.handlebars](/views/admin/users/edit.handlebars) | Handlebars | 26 | 0 | 3 | 29 |
| [views/admin/users/index.handlebars](/views/admin/users/index.handlebars) | Handlebars | 31 | 0 | 1 | 32 |
| [views/admin/users/password.handlebars](/views/admin/users/password.handlebars) | Handlebars | 17 | 0 | 2 | 19 |
| [views/home/about.handlebars](/views/home/about.handlebars) | Handlebars | 3 | 0 | 0 | 3 |
| [views/home/account/posts.handlebars](/views/home/account/posts.handlebars) | Handlebars | 39 | 0 | 1 | 40 |
| [views/home/account/profile.handlebars](/views/home/account/profile.handlebars) | Handlebars | 33 | 0 | 1 | 34 |
| [views/home/category.handlebars](/views/home/category.handlebars) | Handlebars | 30 | 7 | 9 | 46 |
| [views/home/index.handlebars](/views/home/index.handlebars) | Handlebars | 30 | 7 | 9 | 46 |
| [views/home/login.handlebars](/views/home/login.handlebars) | Handlebars | 28 | 6 | 1 | 35 |
| [views/home/my-account/comments/index.handlebars](/views/home/my-account/comments/index.handlebars) | Handlebars | 52 | 0 | 5 | 57 |
| [views/home/my-account/index.handlebars](/views/home/my-account/index.handlebars) | Handlebars | 19 | 0 | 3 | 22 |
| [views/home/my-account/messages/index.handlebars](/views/home/my-account/messages/index.handlebars) | Handlebars | 59 | 9 | 3 | 71 |
| [views/home/my-account/posts/create.handlebars](/views/home/my-account/posts/create.handlebars) | Handlebars | 45 | 0 | 3 | 48 |
| [views/home/my-account/posts/edit.handlebars](/views/home/my-account/posts/edit.handlebars) | Handlebars | 44 | 0 | 1 | 45 |
| [views/home/my-account/posts/index.handlebars](/views/home/my-account/posts/index.handlebars) | Handlebars | 40 | 0 | 2 | 42 |
| [views/home/my-account/profile/edit.handlebars](/views/home/my-account/profile/edit.handlebars) | Handlebars | 20 | 10 | 4 | 34 |
| [views/home/my-account/profile/index.handlebars](/views/home/my-account/profile/index.handlebars) | Handlebars | 16 | 0 | 2 | 18 |
| [views/home/my-account/profile/password.handlebars](/views/home/my-account/profile/password.handlebars) | Handlebars | 20 | 0 | 4 | 24 |
| [views/home/post.handlebars](/views/home/post.handlebars) | Handlebars | 61 | 24 | 27 | 112 |
| [views/home/register.handlebars](/views/home/register.handlebars) | Handlebars | 42 | 1 | 0 | 43 |
| [views/layouts/admin.handlebars](/views/layouts/admin.handlebars) | Handlebars | 147 | 9 | 15 | 171 |
| [views/layouts/home.handlebars](/views/layouts/home.handlebars) | Handlebars | 35 | 1 | 22 | 58 |
| [views/partials/admin/admin-side-nav.handlebars](/views/partials/admin/admin-side-nav.handlebars) | Handlebars | 44 | 0 | 1 | 45 |
| [views/partials/admin/footer.handlebars](/views/partials/admin/footer.handlebars) | Handlebars | 96 | 1 | 3 | 100 |
| [views/partials/home/footer.handlebars](/views/partials/home/footer.handlebars) | Handlebars | 61 | 0 | 3 | 64 |
| [views/partials/home/form-msgs.handlebars](/views/partials/home/form-msgs.handlebars) | Handlebars | 15 | 0 | 2 | 17 |
| [views/partials/home/home-nav.handlebars](/views/partials/home/home-nav.handlebars) | Handlebars | 44 | 6 | 0 | 50 |
| [views/partials/home/my-account-nav.handlebars](/views/partials/home/my-account-nav.handlebars) | Handlebars | 20 | 4 | 0 | 24 |
| [views/partials/home/sidebar.handlebars](/views/partials/home/sidebar.handlebars) | Handlebars | 21 | 17 | 4 | 42 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)