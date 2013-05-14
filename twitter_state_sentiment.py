import sys
import json

# _____________________________________________________________________
# The purpose of this script is to calculate the sentiment of US States
# based on the tweets sourced from a live twitter feed
# 
# 
# written by: Gurdip Khasriya May 2013
# _____________________________________________________________________


# Build a dictionary of subjective words attached to a sentiment value
def sentimentDict(fp):
	di = {}
	for line in fp:
		els = line.strip().split('\t')
		# print els
		di[els[0]] = int(els[1])
	return di

# Creates a list of states and texts from tweets that are from the USA
# and possess a state in their location data
def tweetStatesandText(fp):
	stateList = []
	textList = []
	for string in fp:
		try:
			tweet = json.loads(string)
		except:
			exit("TWEET NOT PARSED")
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


# Calculates the sentiment value of each tweet by matching words of a 
# tweet to a word in the sentiment dictionary
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


# Tweets are aggregated by their state, and the average mood of each
# state is calculated by counting and totalling tweets + sentiments
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

# Testing for the main method
def hw():
    print 'Hello, world!'

# Testing for the main method
def lines(fp):
    print str(len(fp.readlines()))

# main method calls all of the relevant functions, and prints the results
# in JSON format for use in the D3.js heat map of the USA
def main():
    sent_file = open(sys.argv[1])
    tweet_file = open(sys.argv[2])
    sentiments = sentimentDict(sent_file)
    listStates, listTweets = tweetStatesandText(tweet_file)
    scoreList = calcSentiment(sentiments, listTweets)

    results = json.dumps(aggregateStateSentiments(listStates, scoreList))
    print results


if __name__ == '__main__':
    main()




