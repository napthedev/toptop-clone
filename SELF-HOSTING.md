# Self Hosting | Installation

Here are the steps to setup this project

## All variables

- `NEXTAUTH_SECRET`: go to [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) to generate a new next-auth secret
- `NEXTAUTH_URL`: http://localhost:3000 only needed for development
- `DATABASE_URL`: a mysql database connection string, you should use [planetscale.com](https://planetscale.com/) to provision one
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: see Google OAuth credentials section below
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`: see Facebook OAuth credentials section below
- `NEXT_PUBLIC_UPLOAD_URL`: a self host version of this project [discloud](https://github.com/napthedev/discloud)
- `NEXT_PUBLIC_IMAGE_UPLOAD_URL`: See discord webhook url section below

### Google OAuth credentials

- Go to [console.cloud.google.com/](https://console.cloud.google.com/)
- Create a new project
- Go to "API & Services" -> OAuth Content Screen
  - Enter the app name, email, and the authorized domains \| Save and continue
  - Add "auth/userinfo.email" and "auth/userinfo.profile" to the scope \| Save and continue
  - Continue to dashboard
- Press "PUBLISH APP"
- Go to Credentials
  - Create credentials -> OAuth client ID
    - Application type: "Web application"
      - Add "http://localhost:3000" to authorized javascript origins
      - Add "http://localhost:3000/api/auth/callback/google" to Authorized redirect URIs
- Copy the client id and secret and use as the env. See [.env.example](/.env.example)

### Facebook OAuth credentials

- Go to [developers.facebook.com/apps/create/](https://developers.facebook.com/apps/create/) to create an app of type "Consumer"
- Enter the app name and create the app
- Go to Settings -> Basic, copy the App ID and App Secret to the env. See [.env.example](/.env.example)
- Go to [freeprivacypolicy.com/free-privacy-policy-generator](https://www.freeprivacypolicy.com/free-privacy-policy-generator/) to create a new privacy policy and copy the URL into the Privacy Policy URL field in the Facebook settings
- Go to [freeprivacypolicy.com/free-terms-and-conditions-generator](https://www.freeprivacypolicy.com/free-terms-and-conditions-generator/) to create new terms of service and copy the URL into the Terms of Service URL field in the Facebook settings
- Go to [gdprprivacynotice.com](https://www.gdprprivacynotice.com/) to create a User data deletion policy and copy the URL into the data deletion instructions URL field in the Facebook settings
- Click add product in the sidebar
  - Click on "Setup" on Facebook login
  - Click on "Facebook Login" -> "Settings" in the left sidebar
  - Add "https://localhost:3000/api/auth/callback/facebook" to "Valid OAuth Redirect URIs"
  - Save changes
- Change App Mode in the header to "Live".

### Discord webhook url

- Go to discord and create a new Server. The only member must be you only so that no one can access your files.
- Create a new text channel
- Click on the cog icon ⚙️ to "Edit channel"
- Go to "Integration" tab
- Click on "View webhooks"
- "Create a new webhook" and then "Copy Webhook URL". Use that URL as DISCORD_WEBHOOK_URL environment variable
