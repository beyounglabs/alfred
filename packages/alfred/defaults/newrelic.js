'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['%newrelic.app.name%'],
  /**
   * Your New Relic license key.
   */
  license_key: '%newrelic.key%',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },
  transaction_tracer: { record_sql: 'raw' },
  error_collector: {
    ignore_status_codes: [400, 401, 403, 404, 429],
  },
  slow_sql: {
    enabled: true,
  },
  feature_flag: { new_promise_tracking: true },
};
