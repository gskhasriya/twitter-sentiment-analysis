import sys
import json

# WORKING
def sentimentDict(fp):
	di = {}
	for line in fp:
		els = line.strip().split('\t')
		# print els
		di[els[0]] = int(els[1])
	return di

# WORKING - returns the list of states and texts for each tweet
def tweetStatesandText(fp):
	stateList = []
	textList = []
	for string in fp:
		try:
			tweet = json.loads(string)
		except:
			exit("WARNING!!!!! TWEET NOT PARSED")
		tweetState = ""
		tweetText = ""
		if 'text' in tweet and 'place' in tweet and tweet['place'] != None:
			tweetPlace = tweet['place']
			# print tweetPlace
			if 'country_code' in  tweetPlace and tweetPlace['country'] == 'United States':
				fullName = tweetPlace['full_name']
				# print fullName
				if fullName[-4:-2] == ', ':
					stateCode = fullName[-2:]
					tweetText = tweet['text']
					# print stateCode
					stateList.append(stateCode)
					textList.append(tweetText)
	return stateList, textList


# WORKING
def calcSentiment(sentimentDict,tweetList):
	listSentiment = []
	for line in tweetList:
		words = line.split()
		sentiment = 0
		for word in words:
			if word in sentimentDict:
				sentiment += sentimentDict[word]
		listSentiment.append(sentiment)
	return listSentiment


# NEXT STEP - Putting together tweet state and total mood!
def aggregateStateSentiments (stateList, scoreList):
	
	states = stateList
	scores = scoreList

	stateToScore = dict(zip(states,scores))

	stateSentimentCount = {}

	for i in stateList:
		if i in stateSentimentCount:
			stateSentimentCount[i] += 1
		else:
			stateSentimentCount[i] = 1

	statetoScoreAvg = {}

	for i in stateToScore:
		if i in stateSentimentCount:
			statetoScoreAvg[i] = float(stateToScore[i]) / float(stateSentimentCount[i])
	return statetoScoreAvg


def hw():
    print 'Hello, world!'

def lines(fp):
    print str(len(fp.readlines()))

def main():
    sent_file = open(sys.argv[1])
    tweet_file = open(sys.argv[2])
    # Dictionary of sentiments and value
    sentiments = sentimentDict(sent_file)
    listStates, listTweets = tweetStatesandText(tweet_file)

    scoreList = calcSentiment(sentiments, listTweets)

    # print listStates
    # print calcSentiment(sentiments, listTweets)

    results = json.dumps(aggregateStateSentiments(listStates, scoreList))
    print results


if __name__ == '__main__':
    main()




