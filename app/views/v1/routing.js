module.exports = () => {
  const govukPrototypeKit = require('govuk-prototype-kit');
  const subRouter = govukPrototypeKit.requests.setupRouter();

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

  // ---- ORDER OF COST PAGES ----
  // Add/remove/reorder freely
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

  // Route lookup
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

  // Helper: get the next selected page after the current one
  function nextPage(selected, current) {
    const index = costOrder.indexOf(current);
    for (let i = index + 1; i < costOrder.length; i++) {
      if (selected.includes(costOrder[i])) {
        return costRoutes[costOrder[i]];
      }
    }
    // If nothing left → go to next big step
    return '/calculator/child-1/check-answers';
  }

  // --------- AMOUNT & NAMES ----------

  subRouter.post('/calculator/child-amount', (req, res) => {
    res.redirect('/calculator/child-name');
  });

  subRouter.post('/calculator/child-name', (req, res) => {
    res.redirect('./child-1/choose-costs');
  });

  // --------- CHOOSE COSTS ----------

  subRouter.post('/calculator/child-1/choose-costs', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];

    // Find the first chosen cost page
    const first = costOrder.find(key => selected.includes(key));

    if (first) {
      return res.redirect(costRoutes[first]);
    }

    // If nothing selected, skip all the pages
    return res.redirect('/calculator/child-1/check-answers');
  });

  // --------- NEW: COST PAGE STEP HANDLERS ----------

  // Babycare → next selected
  subRouter.post('/calculator/child-1/costs-babycare', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'baby'));
  });

  // Clothing → next selected
  subRouter.post('/calculator/child-1/costs-clothing', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'clothes'));
  });

  // School → next selected
  subRouter.post('/calculator/child-1/costs-school', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'school'));
  });

  // Hobbies → next selected
  subRouter.post('/calculator/child-1/costs-hobbies', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'hobbies'));
  });

  // Childcare → next selected
  subRouter.post('/calculator/child-1/costs-childcare', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'childcare'));
  });

  // Day-to-day care → next selected
  subRouter.post('/calculator/child-1/costs-daycare', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'daycare'));
  });

  // Transport → next selected
  subRouter.post('/calculator/child-1/costs-transport', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'transport'));
  });

  // One-time → next selected
  subRouter.post('/calculator/child-1/costs-onetime', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'onetime'));
  });

  // Other → next selected
  subRouter.post('/calculator/child-1/costs-other', (req, res) => {
    const selected = req.session.data['child1-costs'] || [];
    res.redirect(nextPage(selected, 'other'));
  });

  return subRouter;
};
