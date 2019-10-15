frontend:
	npx webpack --config webpack.config.js

frontend-watch:
	npx webpack --config webpack.config.js --watch

dev-server:
	FLASK_APP=twitter_virtual FLASK_ENV=development flask run --host=127.0.0.1

dev-server-public:
	FLASK_APP=twitter_virtual FLASK_ENV=development flask run --host=0.0.0.0
