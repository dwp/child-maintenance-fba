module.exports = () => {
  // Bring in the GOV.UK Prototype Kit tools
  const govukPrototypeKit = require('govuk-prototype-kit');

  // Create a router for THIS version (e.g. /v1 or /v2)
  // Think of this as "all the rules for how pages flow in this journey"
  const subRouter = govukPrototypeKit.requests.setupRouter();


  // =========================================================
  // VERSION DETECTION
  // =========================================================

  // This grabs the version from the URL (e.g. /v1 or /v2)
  // and makes it available in all templates as "version"
  //
  // Example:
  // version = "/v2"
  //
  // This is used so things like the service URL link
  // will always go to the correct version of the prototype

  subRouter.use((req, res, next) => {
    const match = req.originalUrl.match(/^\/(v\d+)/);
    res.locals.version = match ? `/${match[1]}` : '';
    next();
  });

  // =========================================================
  // AUTO-PREFIX REDIRECTS WITH VERSION
  // =========================================================

  // This automatically adds /v1 or /v2 to redirects
  //
  // With this:
  //   res.redirect('/home') → goes to /v2/home
  //
  // This means you don't need to worry about versions
  // when writing redirects — it happens automatically

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

subRouter.post('/agreement/child-amount', (req, res) => {
  res.redirect('child-name');
});

subRouter.post('/agreement/child-name', (req, res) => {
  res.redirect('parent-name');
});

subRouter.post('/agreement/parent-name', (req, res) => {
  res.redirect('choose-agreement');
});


// -------------------------------------
// AGREEMENT ORDER + FLOWS
// -------------------------------------

const agreementOrder = [
  'regular',
  'split',
  'oneOff',
  'household'
];

// ✅ Each agreement now has its own sequence of pages
const agreementFlows = {
  regular: [
    '/agreement/regular-payment',
    '/agreement/regular-who-pays',
    '/agreement/regular-method',
    '/agreement/regular-additional-details'
  ],
  split: [
    '/agreement/split-costs',
    '/agreement/split-how-paid',
    '/agreement/split-method',
    '/agreement/split-additional-details'
  ],
  oneOff: [
    '/agreement/one-off-costs',
    '/agreement/one-off-additional-details'
  ],
  household: [
    '/agreement/household-costs',
    '/agreement/household-who-pays',
    '/agreement/household-method',
    '/agreement/household-additional-details'
  ]
};


// -------------------------------------
// NEXT PAGE LOGIC
// -------------------------------------

function nextPage(selected, currentAgreement, currentPath) {
  const steps = agreementFlows[currentAgreement];
  const stepIndex = steps.indexOf(currentPath);

  // ✅ Move to next step in same agreement
  if (stepIndex !== -1 && stepIndex < steps.length - 1) {
    return steps[stepIndex + 1];
  }

  // ✅ Move to next selected agreement
  const agreementIndex = agreementOrder.indexOf(currentAgreement);

  for (let i = agreementIndex + 1; i < agreementOrder.length; i++) {
    const nextAgreement = agreementOrder[i];

    if (selected.includes(nextAgreement)) {
      return agreementFlows[nextAgreement][0];
    }
  }

  // ✅ End of journey
  return '/agreement/anything-else';
}


// -------------------------------------
// START FLOW
// -------------------------------------

subRouter.post('/agreement/choose-agreement', (req, res) => {
  const selected = req.session.data['agreement-choices'] || [];

  const first = agreementOrder.find(key => selected.includes(key));

  if (first) {
    return res.redirect(agreementFlows[first][0]);
  }

  return res.redirect('/agreement/anything-else');
});


// -------------------------------------
// REGULAR FLOW (4 QUESTIONS)
// -------------------------------------

subRouter.post('/agreement/regular-payment', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'regular', '/agreement/regular-payment'));
});

subRouter.post('/agreement/regular-who-pays', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'regular', '/agreement/regular-who-pays'));
});

subRouter.post('/agreement/regular-method', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'regular', '/agreement/regular-method'));
});

subRouter.post('/agreement/regular-additional-details', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'regular', '/agreement/regular-additional-details'));
});


// -------------------------------------
// (PLACEHOLDER ROUTES - KEEP FOR NOW)
// Replace these later with real pages
// -------------------------------------

// SPLIT
subRouter.post('/agreement/split-costs', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'split', '/agreement/split-costs'));
});

subRouter.post('/agreement/split-how-paid', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'split', '/agreement/split-how-paid'));
});

subRouter.post('/agreement/split-method', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'split', '/agreement/split-method'));
});

subRouter.post('/agreement/split-additional-details', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'split', '/agreement/split-additional-details'));
});


// ONE-OFF
subRouter.post('/agreement/one-off-costs', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'oneOff', '/agreement/one-off-costs'));
});

subRouter.post('/agreement/one-off-additional-details', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'oneOff', '/agreement/one-off-additional-details'));
});


// HOUSEHOLD
subRouter.post('/agreement/household-costs', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'household', '/agreement/household-costs'));
});

subRouter.post('/agreement/household-who-pays', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'household', '/agreement/household-who-pays'));
});

subRouter.post('/agreement/household-method', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'household', '/agreement/household-method'));
});

subRouter.post('/agreement/household-additional-details', (req, res) => {
  res.redirect(nextPage(req.session.data['agreement-choices'] || [], 'household', '/agreement/household-additional-details'));
});

subRouter.post('/agreement/anything-else', (req, res) => {
  res.redirect('/agreement/check-answers');
});

subRouter.post('/agreement/check-answers', (req, res) => {
  res.redirect('/agreement/output');
});





  
  // =========================================================
  // CHOICES JOURNEY (Unique to v2+)
  // =========================================================

  // Simple decision routing using subRouter

  subRouter.post('/choices/safety-answer', (req, res) => {
    const safetyConcerns = req.session.data['safetyConcerns'];
    if (safetyConcerns === "yes") {
      return res.redirect('/choices/getting-help');
    }
    return res.redirect('/choices/financial-arrangement');
  });

  subRouter.post('/choices/FA-answer', (req, res) => {
    const doYouHaveFA = req.session.data['doYouHaveFA'];
    if (doYouHaveFA === "no") {
      return res.redirect('/choices/create-arrangement');
    }
    return res.redirect('/choices/review-arrangement');
  });

  subRouter.post('/choices/create-answer', (req, res) => {
    const createFA = req.session.data['createFA'];
    if (createFA === "yes") {
      return res.redirect('/choices/why-do-you-need-to-create');
    }
    return res.redirect('/choices/care-arrangement');
  });

  subRouter.post('/choices/review-answer', (req, res) => {
    const reviewFA = req.session.data['reviewFA'];
    if (reviewFA === "yes") {
      return res.redirect('/choices/why-do-you-need-to-review');
    }
    return res.redirect('/choices/care-arrangement');
  });  

  // Always return the router at the end
  return subRouter;
};