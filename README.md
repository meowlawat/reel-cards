# Reel Cards

A scrapbook for lessons from short videos. Save an editable question, try it from memory and let your answer set the next review date.

## Instagram integration

This is a standalone prototype for a proposed Instagram feature. Meta's public Instagram APIs document professional account workflows such as publishing and insights. There is no documented extension point to add our button to Instagram's native Save menu. That placement would require Meta to implement or support it. A separate companion app could accept a user-shared link and a user-authored or creator-supplied lesson. A link alone does not grant access to the video or transcript. See [Meta’s Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api).

Open **index.html** for the offline demo. Keep data.js beside it. No installation, sign-in, build, key or internet connection is needed.

For the backend demo, open a terminal in this folder and run **python server.py** with Python 3, then visit **http://127.0.0.1:8765**. On Windows, **py server.py** also works with the Python launcher. Stop with Ctrl+C. The private, single-user library is kept in learned.sqlite3 in this folder. The file and server modes have separate libraries.

## Demonstrate it in one minute

1. Open the garlic pasta reel and inspect the steps. Save it. Save the desk stretch reel from the feed too.
2. Open Learned, choose View or edit card, and change a question to the detail you personally forget. Save the edit.
3. Choose Review all due. Try answering aloud, flip, and expand the follow-up. Rate one card Got it and the other Forgot.
4. Show the summary and reopen Learned. Both first reviews return tomorrow. On the next successful review the remembered card advances to three days. A forgotten card restarts at one day. Reload to show persistence.

## Decisions made

This is a feature proposal for Instagram under ProdVerse Theme 02. Sample creators, counts and prepared cards illustrate the experience. There is no Instagram integration or inference. Creation is explicit. No viewing activity is collected. The standalone mode uses localStorage or temporary memory if storage is blocked. Backend mode uses a loopback JSON API, transactional SQLite storage and server-calculated review dates. The server rejects stale duplicate review submissions. Backend mode requires the local server to be running, even without internet.

The pitch proposes on-device extraction as future development. The questionnaire's opening is a sample first-person scenario to personalise. The pitch avoids unsupported audience and memory-loss figures. Fitness and study cards reproduce the supplied examples.
