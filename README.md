# Food Map
Mapping when/where food pickups are available during covid-19 crisis.

Live site: http://pantries.openmaine.org/

Check out the [wiki](https://github.com/OpenMaine/covid19-foodmap/wiki) for ways to get involved!

# Contributing changes
We're excited for you to help improve this project. We've outlined a few steps to get it running locally as easily as possible. Let us know on Slack if you run into any trouble!

## Option #1: Use npm
1. Download and install Node.js and npm (if needed) from https://nodejs.org/en/


2. Open a command prompt to the root directory of the covid19-foodmap and install dependencies:
```
$ npm install
```

3. Start the development server:
```
$ npm start
```

## Option #2: Use Docker 
1. Install Docker Desktop (for [Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac) or [Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows))
2. Pull the code down:
```
git clone git@github.com:OpenMaine/covid19-foodmap.git
```
3. Build the image:
```
docker build -t covid19-foodmap .
```

4. Run the container:
```
docker run -p 8080:8080
--mount type=bind,source="$(pwd)",target=/usr/src/app
--volume node_modules:/usr/src/app/node_modules
covid19-foodmap
```
5. Navigate to http://127.0.0.1:8080

Due to differences in host and container package binaries, node_modules is NOT sync'd. If you prefer (for IDE features or other needs) to have a copy of the packages installed on your host project directory as well, you'll need to run npm install in both locations when changes to package.json happen:

```
npm install && docker container exec "$(docker ps --filter ancestor=covid19-foodmap --filter status=running -n 1 -q)" npm install
```

# Community Partners

We've been asked by the Mutual Aid group Mainers Together (mainerstogether.com) to put together a map for their organizers to use when assisting need requests. This map would have updated hours and pick up/drop off locations. We will coordinate with Mainers Together to conduct outreach and data validation.
