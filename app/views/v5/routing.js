module.exports = function (router) {

router.post('/v5/get-help/da-screening-answer', function (req, res) {
  var moreInfo = req.session.data['moreInfo'];
  var arrangementType = req.session.data['fa-type'];

  if (moreInfo === 'yes') {
    res.redirect('da-info');
  } else {
    if (arrangementType === 'private') {
      res.redirect('what-do-you-need');
    } else if (arrangementType === 'cms') {
      res.redirect('where-do-you-live');
    } else if (arrangementType === 'idk') {
      res.redirect('both-parents');
    } else {
      // Fallback route if fa-type is not set or unexpected
      res.redirect('what-do-you-need');
    }
  }
});

router.post('/v5/get-help/da-info-answer', function (req, res) {
  var arrangementType = req.session.data['fa-type'];

  if (arrangementType === 'private') {
    res.redirect('what-do-you-need');
  }

  if (arrangementType === 'cms') {
    res.redirect('where-do-you-live');
  }

  if (arrangementType === 'idk') {
    res.redirect('both-parents');
  }

  // Fallback route if fa-type is not set or unexpected
  res.redirect('what-do-you-need');
});

router.post('/v5/get-help/help-needed-answer', function (req, res) {
  var helpNeeded = req.session.data['help-needed'];

  if (helpNeeded && helpNeeded.includes('none')) {
    res.redirect('use-cms');
  } else {
    res.redirect('recommendations');
  }
});

router.post('/v5/get-help/both-parents-answer', function (req, res) {
  var workingTogether = req.session.data['workingTogether'];

  if (workingTogether == "yes"){
    res.redirect("what-do-you-need");
  } else {
    res.redirect("use-cms");
  }
});

router.post('/v5/get-help/cms-apply-answer', function (req, res) {
  var cmsApply = req.session.data['cms-apply'];

  if (cmsApply == "yes"){
    res.redirect("where-do-you-live");
  } else {
    res.redirect("recommendations");
  }
});

};