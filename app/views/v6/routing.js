module.exports = function (router) {

  router.post('/v6/arrangement/arrangement-type-answer', function (req, res) {
    const arrangement = req.session.data['arrangement-type']

    if (arrangement.includes('regular') && arrangement.includes('shared')) {
      return res.redirect("regular-who-pays")
    }
    if (arrangement.includes('regular')) {
      return res.redirect("regular-who-pays")
    }
    if (arrangement.includes('shared')) {
      return res.redirect("shared-costs")
    }
    if (arrangement.includes('other')) {
      return res.redirect("what-is-your-arrangement")
    }
  });

  router.post('/v6/arrangement/regular-and-shared-check', function (req, res) {
    const arrangement = req.session.data['arrangement-type']

    if (arrangement.includes('shared')) {
      return res.redirect("shared-costs")
    }
    else {
      return res.redirect("anything-else")
    }
  });
  
  router.post('/v6/arrangement/share-equally-answer', function (req, res) {
    var equallyAnswer = req.session.data['shareEqually'];

    if (equallyAnswer == "yes"){
      res.redirect("anything-else");
    } else {
      res.redirect("shared-most");
    }

  })

  router.post('/v6/arrangement/share-most-answer', function (req, res) {
    var payMostAnswer = req.session.data['shareMost'];

    if (payMostAnswer == "yes"){
      res.redirect("anything-else");
    } else {
      res.redirect("shared-how");
    }

  })

  router.post('/v6/cost-worksheet/choose-costs-answer', function (req, res) {

    const costs = req.session.data['cw-shared-cost'] || []

    req.session.data.selectedCosts = costs

    if (costs.length === 0) {
      return res.redirect('/v6/cost-worksheet/choose-costs')
    }

    return res.redirect(`/v6/cost-worksheet/child-1/${costs[0]}`)
  })


  router.post('/v6/cost-worksheet/next-cost', function (req, res) {

    const costs = req.session.data.selectedCosts || []
    const currentCost = req.body['current-cost']

    const index = costs.indexOf(currentCost)

    if (index === -1 || index >= costs.length - 1) {
      return res.redirect('/v6/cost-worksheet/child-1/check-answers')
    }

    return res.redirect(
      `/v6/cost-worksheet/child-1/${costs[index + 1]}`
    )
  })

  
};