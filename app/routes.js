const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Mount versions
router.use('/v1', require('./views/v1/routing')());
router.use('/v2', require('./views/v2/routing')());
require('./views/v3/routing')(router);



module.exports = router;