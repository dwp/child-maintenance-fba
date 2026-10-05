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
  router.post('/v6/cost-worksheet/child-1/choose-costs-answer', function (req, res) {

    // Get all selected checkbox values from the page.
    const costs = req.session.data['child1-shared-cost'] || []

    // Store the selected costs in session data so they can be accessed throughout the rest of the journey.
    req.session.data.selectedCosts = costs

    // If nothing has been selected, return the user to the choose costs page.
    if (costs.length === 0) {
      return res.redirect('/v6/cost-worksheet/child-1/choose-costs')
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
  
  // Checking if there is a second child
  router.post('/v6/cost-worksheet/child-1/child2-check', function (req, res) {
    // If the value is empty, undefined or invalid, default to 1.
    const childAmount = parseInt(req.session.data['cw-child-amount'], 10) || 1;

    // If there is more than 1 child, continue to the child 2 journey.
    if (childAmount > 1) {
      res.redirect('/v6/cost-worksheet/child-2/same-costs');

    // Otherwise, treat it as a single-child case and continue to confirmation.
    } else {
      res.redirect('confirmation');
    }
  });

  // Checking if there is a third child
  router.post('/v6/cost-worksheet/child-2/child3-check', function (req, res) {
    // If the value is empty, undefined or invalid, default to 1.
    const childAmount = parseInt(req.session.data['cw-child-amount'], 10) || 1;

    // If there is more than 3 children, continue to the child 2 journey.
    if (childAmount > 1) {
      res.redirect('/v6/cost-worksheet/child-3/choose-costs');

    // Otherwise, treat it as a single-child case and continue to confirmation.
    } else {
      res.redirect('confirmation');
    }
  });

  // Do you want to include the same spending all children?
  router.post('/v6/cost-worksheet/child-2/same-costs-check', function (req, res) {
    var sameCosts = req.session.data['sameCosts'];

    if (sameCosts == "yes"){
      res.redirect("../check-answers-all");
    } else {
      res.redirect("choose-costs");
    }

  })

  // Child 2: User submits the "Choose costs" page
  router.post('/v6/cost-worksheet/child-2/child2-choose-costs-answer', function (req, res) {

    const costs = req.session.data['child2-shared-cost'] || []

    req.session.data.selectedCostsChild2 = costs

    if (costs.length === 0) {
      return res.redirect('/v6/cost-worksheet/child-2/choose-costs')
    }

    return res.redirect(`/v6/cost-worksheet/child-2/${costs[0]}`)
  })

  // Child 2: User clicks Continue on any cost category page
  router.post('/v6/cost-worksheet/child2-next-cost', function (req, res) {

    const costs = req.session.data.selectedCostsChild2 || []

    const currentCost = req.body['current-cost']

    const index = costs.indexOf(currentCost)

    if (index === -1 || index >= costs.length - 1) {
      return res.redirect('/v6/cost-worksheet/child-2/check-answers')
    }

    return res.redirect(
      `/v6/cost-worksheet/child-2/${costs[index + 1]}`
    )
  })  


  // Child 3: User submits the "Choose costs" page
  router.post('/v6/cost-worksheet/child-3/child3-choose-costs-answer', function (req, res) {

    const costs = req.session.data['child3-shared-cost'] || []

    req.session.data.selectedCostsChild3 = costs

    if (costs.length === 0) {
      return res.redirect('/v6/cost-worksheet/child-3/choose-costs')
    }

    return res.redirect(`/v6/cost-worksheet/child-3/${costs[0]}`)
  })

  // Child 3: User clicks Continue on any cost category page
  router.post('/v6/cost-worksheet/child3-next-cost', function (req, res) {

    const costs = req.session.data.selectedCostsChild3 || []

    const currentCost = req.body['current-cost']

    const index = costs.indexOf(currentCost)

    if (index === -1 || index >= costs.length - 1) {
      return res.redirect('/v6/cost-worksheet/child-3/check-answers')
    }

    return res.redirect(
      `/v6/cost-worksheet/child-3/${costs[index + 1]}`
    )
  })  
    
};