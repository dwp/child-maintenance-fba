module.exports = function (router) {

  //// FINANCIAL ARRANGEMENT

  // User submits the arrangement type page
  router.post('/v6/arrangement/arrangement-type-answer', function (req, res) {

    // Get the selected arrangement type(s) from session data.
    // Because this is a checkbox question, the user may have selected more than one option.
    const arrangement = req.session.data['arrangement-type']

    // If both "regular" and "shared" have been selected, start the journey with the regular payments section.
    if (arrangement.includes('regular') && arrangement.includes('shared')) {
      return res.redirect("regular-who-pays")
    }
    // If only "regular" has been selected, go to the regular payments journey.
    if (arrangement.includes('regular')) {
      return res.redirect("regular-who-pays")
    }
    // If only "shared" has been selected, go to the shared costs journey.
    if (arrangement.includes('shared')) {
      return res.redirect("shared-costs")
    }
    // If "other" has been selected, ask the user to describe their arrangement.
    if (arrangement.includes('other')) {
      return res.redirect("what-is-your-arrangement")
    }
  });

  // After completing the regular payments journey, check if the user has selected "shared"
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

  //// COST WORKSHEET

  // User submits the "Choose costs" page
  router.post('/v6/cost-worksheet/choose-costs-answer', function (req, res) {

    // Get all selected checkbox values from the page.
    const costs = req.session.data['cw-shared-cost'] || []

    // Store the selected costs in session data so they can be accessed throughout the rest of the journey.
    req.session.data.selectedCosts = costs

    // If nothing has been selected, return the user to the choose costs page.
    if (costs.length === 0) {
      return res.redirect('/v6/cost-worksheet/choose-costs')
    }

    // Redirect to the first selected cost category.
    return res.redirect(`/v6/cost-worksheet/child-1/${costs[0]}`)
  })

  // IMPORTANT:
  //
  // Every category page must contain a hidden field:
  //
  // <input type="hidden" name="current-cost" value="x">
  //
  // Replace "x" with the value for that category page.
  //
  // This allows the router to determine which page has just
  // been submitted and calculate the correct next page.
  //
  // Using the hidden field instead of a session counter means
  // browser Back button behaviour works correctly and prevents
  // categories being skipped.


  // User clicks Continue on any cost category page
  router.post('/v6/cost-worksheet/next-cost', function (req, res) {

    // Retrieve the user's selected costs from session data.
    const costs = req.session.data.selectedCosts || []

    // Get the current category from the hidden field on the page.
    const currentCost = req.body['current-cost']

    // Find the position of the current category within the selected costs array.
    const index = costs.indexOf(currentCost)

    // If:
    // - the current category cannot be found, OR
    // - the current category is the last selected category
    //
    // then send the user to Check Answers.
    if (index === -1 || index >= costs.length - 1) {
      return res.redirect('/v6/cost-worksheet/child-1/check-answers')
    }

    // Otherwise, redirect to the next selected category.
    return res.redirect(
      `/v6/cost-worksheet/child-1/${costs[index + 1]}`
    )
  })

  
};