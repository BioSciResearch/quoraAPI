/*
  This file contains the primary content types (questions, answers, posts, shares, etc.)
  it heavily utilizes parseQContent to reformat api data appropriately and parseHelpers 
  for redundant remapping patterns.
*/
const {conserved, user, content, getType} = require('./parseHelpers')
const {parseQContentObj, qContentText, sanitizeLink} = require('./parseQContent')


/***   Content Types   ***/
const question = obj => {
  return {
    ...conserved(obj),
    // user added in post
    content: {
      title: qContentText(obj.title),
      refLink: obj.sourceUrl,
      answerCount: obj.answerCount
    }
  }
}

const unanswered = question

const answer = obj => {
  return {
    ...conserved(obj),
    ...user(obj),
    content: {
      question: question(obj.question),
      title: qContentText(obj.question.title),
      ...content(obj.content)
    }
  }
}

const post = obj => {
  return {
    ...conserved(obj),
    ...user(obj),
    content: {
      title: qContentText(obj.title),  // ??
      ...content(obj.content)
    }
  }
}

/***   Share Types   ***/
const hyperlink = obj => {
  return {
    type: obj.__typename,
    image: obj.imageUrls[0],
    unix: obj.publishTime,
    site: obj.publisherSitename,
    favicon: obj.publisherIconUrl,
    url: obj.originalUrl,
    title: obj.title,
    text: obj.description
  }
}


function getShare(obj) {
  var shareOG  = obj.share
  const subtype = getType(shareOG)
  
  const share = {
    ...conserved,
    ...user(shareOG),
    type: 'share',

    content: {
      source: sanitizeLink(shareOG.url),
      comment: qContentText(shareOG.comment),
      refLink: shareOG.embeddedContentUrl, // only if user provided reference for question
      title: shareOG.title,
    },

    shared: (subtype ==='share' ? getShare(shareOG.share) : { hyperlink, question, answer, post }[subtype](shareOG[subtype]))
  }
  return share
}

module.exports = {
  question,
  unanswered,
  answer,
  post,
  hyperlink,
  getShare
}