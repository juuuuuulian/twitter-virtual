frontend:
	npx webpack --config webpack.config.js

dev-server:
	FLASK_APP=twitter_virtual FLASK_ENV=development flask run
