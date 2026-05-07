module.exports = () => {
  const govukPrototypeKit = require('govuk-prototype-kit');
  const subRouter = govukPrototypeKit.requests.setupRouter();

  subRouter.use((req, res, next) => {
    const match = req.originalUrl.match(/^\/(v\d+)/);
    res.locals.version = match ? `/${match[1]}` : '';
    next();
  });

  // Auto-prefix redirects with /v1 or /v2
  subRouter.use((req, res, next) => {
    const originalRedirect = res.redirect;
    res.redirect = function(url) {
      if (url.startsWith('/') && !url.startsWith(req.baseUrl)) {
        url = req.baseUrl + url;
      }
      return originalRedirect.call(this, url);
    };
    next();
  });

  // =============================
  // ==== CALCULATOR ROUTING =====
  // =============================

  // -------------------------------------
  // AMOUNT OF CHILDREN (START OF JOURNEY)
  // -------------------------------------
  //
  // User enters how many children they want to add.
  // Currently this ALWAYS moves straight into the
  // Child 1 journey.
  //
  subRouter.post('/calculator/child-amount', (req, res) => {
    res.redirect('/calculator/child-name');
  });


  // -------------------------------------
  // CHILD NAME ENTRY
  // -------------------------------------
  //
  // User provides the name(s) of the children.
  // After names are entered → begin Child 1 cost selection.
  //
  subRouter.post('/calculator/child-name', (req, res) => {
    res.redirect('./child-1/choose-costs');
  });


  // -------------------------------------
  // ORDER OF COST PAGES
  // -------------------------------------
  //
  // Defines the sequence of cost categories.
  // Both Child 1 and Child 2 reuse this single array.
  // This ensures the flow logic is identical.
  //
  const costOrder = [
    'baby',
    'clothes',
    'school',
    'hobbies',
    'childcare',
    'daycare',
    'transport',
    'onetime',
    'other'
  ];


  // =============================
  // ======== CHILD 1 FLOW =======
  // =============================


  // -------------------------------------
  // COST ROUTES FOR CHILD 1
  // -------------------------------------
  //
  // Maps each cost category (baby, clothes, etc) to a URL.
  // The `nextPage` helper will use this to know where to go.
  //
  const costRoutes = {
    baby: '/calculator/child-1/costs-babycare',
    clothes: '/calculator/child-1/costs-clothing',
    school: '/calculator/child-1/costs-school',
    hobbies: '/calculator/child-1/costs-hobbies',
    childcare: '/calculator/child-1/costs-childcare',
    daycare: '/calculator/child-1/costs-daycare',
    transport: '/calculator/child-1/costs-transport',
    onetime: '/calculator/child-1/costs-onetime',
    other: '/calculator/child-1/costs-other'
  };


  // -------------------------------------
  // HELPER: FIND NEXT SELECTED COST PAGE
  // -------------------------------------
  //
  // Takes:
  // - the selected cost categories from session
  // - the current page category
  //
  // It looks ahead in costOrder and returns
  // the URL of the next selected category.
  //
  // If the user has no more selected categories,
  // we move to child-1/check-answers.
  //
  function nextPage(selected, current) {
    const index = costOrder.indexOf(current);

    // Look ahead from current category
    for (let i = index + 1; i < costOrder.length; i++) {
      if (selected.includes(costOrder[i])) {
        return costRoutes[costOrder[i]];
      }
    }

    // No pages left → go to check answers
    return '/calculator/child-1/check-answers';
  }


  // -------------------------------------
  // CHILD 1: CHOOSE COSTS PAGE
  // -------------------------------------
  //
  // Reads selected checkboxes (stored in child1-costs).
  // Redirects to the *first* selected cost page.
  //
  subRouter.post('/calculator/child-1/choose-costs', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];

    // Find the first selected category in the predefined order
    const first = costOrder.find(key => selected.includes(key));

    if (first) {
      return res.redirect(costRoutes[first]);
    }

    // If user selected nothing, skip all cost pages
    return res.redirect('/calculator/child-1/check-answers');
  });


  // -------------------------------------
  // CHILD 1 COST PAGE HANDLERS
  // -------------------------------------
  //
  // Each cost page simply calls nextPage()
  // to determine where the user should go next.
  //
  subRouter.post('/calculator/child-1/costs-babycare', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'baby'));
  });

  subRouter.post('/calculator/child-1/costs-clothing', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'clothes'));
  });

  subRouter.post('/calculator/child-1/costs-school', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'school'));
  });

  subRouter.post('/calculator/child-1/costs-hobbies', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'hobbies'));
  });

  subRouter.post('/calculator/child-1/costs-childcare', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'childcare'));
  });

  subRouter.post('/calculator/child-1/costs-daycare', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'daycare'));
  });

  subRouter.post('/calculator/child-1/costs-transport', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'transport'));
  });

  subRouter.post('/calculator/child-1/costs-onetime', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'onetime'));
  });

  subRouter.post('/calculator/child-1/costs-other', (req, res) => {
    res.redirect(nextPage(req.session.data['child1-costs'] || [], 'other'));
  });


  // -------------------------------------
  // MOVING FROM CHILD 1 → CHILD 2
  // -------------------------------------
  //
  // When Child 1 check-answers is submitted,
  // we move to Child 2 cost selection if there 
  // is more than 1 child.
  //
  subRouter.post('/calculator/child-1/check-answers', (req, res) => {
    const childAmount = Number(req.session.data['childAmount']);

    if (childAmount > 1) {
      // User added more than one child → go to Child 2 flow
      return res.redirect('../child-2/choose-costs');
    }

    // Only one child → skip Child 2
    return res.redirect('../summary');
  });



  // =============================
  // ======== CHILD 2 FLOW =======
  // =============================


  // -------------------------------------
  // COST ROUTES FOR CHILD 2
  // -------------------------------------
  const costRoutesChild2 = {
    baby: '/calculator/child-2/costs-babycare',
    clothes: '/calculator/child-2/costs-clothing',
    school: '/calculator/child-2/costs-school',
    hobbies: '/calculator/child-2/costs-hobbies',
    childcare: '/calculator/child-2/costs-childcare',
    daycare: '/calculator/child-2/costs-daycare',
    transport: '/calculator/child-2/costs-transport',
    onetime: '/calculator/child-2/costs-onetime',
    other: '/calculator/child-2/costs-other'
  };


  // -------------------------------------
  // HELPER FOR CHILD 2 (same as for child 1)
  // -------------------------------------
  function nextPageChild2(selected, current) {
    const index = costOrder.indexOf(current);

    for (let i = index + 1; i < costOrder.length; i++) {
      if (selected.includes(costOrder[i])) {
        return costRoutesChild2[costOrder[i]];
      }
    }

    return '/calculator/child-2/check-answers';
  }


  // -------------------------------------
  // CHILD 2: CHOOSE COSTS PAGE
  // -------------------------------------
  subRouter.post('/calculator/child-2/choose-costs', (req, res) => {
    const selected = req.session.data['child2-costs'] || [];
    const first = costOrder.find(key => selected.includes(key));

    if (first) {
      return res.redirect(costRoutesChild2[first]);
    }

    return res.redirect('/calculator/child-2/check-answers');
  });


  // -------------------------------------
  // CHILD 2 COST PAGE STEP HANDLERS
  // -------------------------------------
  subRouter.post('/calculator/child-2/costs-babycare', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'baby'));
  });

  subRouter.post('/calculator/child-2/costs-clothing', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'clothes'));
  });

  subRouter.post('/calculator/child-2/costs-school', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'school'));
  });

  subRouter.post('/calculator/child-2/costs-hobbies', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'hobbies'));
  });

  subRouter.post('/calculator/child-2/costs-childcare', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'childcare'));
  });

  subRouter.post('/calculator/child-2/costs-daycare', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'daycare'));
  });

  subRouter.post('/calculator/child-2/costs-transport', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'transport'));
  });

  subRouter.post('/calculator/child-2/costs-onetime', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'onetime'));
  });

  subRouter.post('/calculator/child-2/costs-other', (req, res) => {
    res.redirect(nextPageChild2(req.session.data['child2-costs'] || [], 'other'));
  });


  // -------------------------------------
  // END OF CALCULATOR → SUMMARY PAGE
  // -------------------------------------
  //
  // Child 2 check-answers sends the user to
  // the final summary page.
  //
  subRouter.post('/calculator/child-2/check-answers', (req, res) => {
    res.redirect('../summary');
  });


  // =============================
  // ==== AGREEMENT ROUTING =====
  // =============================

  // -------------------------------------
  // AMOUNT OF CHILDREN AND NAMES
  // -------------------------------------
  //
  subRouter.post('/agreement/child-amount', (req, res) => {
    res.redirect('child-name');
  });

  subRouter.post('/agreement/child-name', (req, res) => {
    res.redirect('parent-name');
  });
  
  subRouter.post('/agreement/parent-name', (req, res) => {
    res.redirect('other-parent-name');
  });

  subRouter.post('/agreement/other-parent-name', (req, res) => {
      res.redirect('paying-or-receiving');
  });  

  subRouter.post('/agreement/paying-or-receiving', (req, res) => {
    res.redirect('include-overnight-stays');
  });

  // -------------------------------------
  // INCLUDE OVERNIGHT STAYS CHOICE
  // -------------------------------------
  //
  // If no, skip user to payment section.
  //
  subRouter.post('/agreement/overnight-answer', (req, res) => {
    const includeOvernight = req.session.data['includeOvernight'];

    if (includeOvernight === 'yes') {
      return res.redirect('/agreement/child-1-nights');
    }

    return res.redirect('/agreement/paying-for-your-children');
  });

  subRouter.post('/agreement/child-1-nights', (req, res) => {
    res.redirect('child-1-extra');
  });

  subRouter.post('/agreement/child-1-extra', (req, res) => {
    const childAmount = Number(req.session.data['childAmount']);

    if (childAmount > 1) {
      // User added more than one child → go to Child 2 flow
      return res.redirect('child-2-nights');
    }

    // Only one child → skip Child 2
    return res.redirect('paying-for-your-children');
  });

  subRouter.post('/agreement/child-1-extra', (req, res) => {
    res.redirect('child-2-nights');
  });

  subRouter.post('/agreement/child-2-nights', (req, res) => {
    res.redirect('child-2-extra');
  });

  subRouter.post('/agreement/child-2-extra', (req, res) => {
    res.redirect('paying-for-your-children');
  });

  subRouter.post('/agreement/paying-for-your-children', (req, res) => {
    res.redirect('review-date');
  });

  subRouter.post('/agreement/review-date', (req, res) => {
    res.redirect('check-answers');
  });

  subRouter.post('/agreement/check-answers', (req, res) => {
    res.redirect('summary');
  });

  return subRouter;
  };