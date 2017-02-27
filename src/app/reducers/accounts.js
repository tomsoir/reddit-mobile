import mergeAPIModels from './helpers/mergeAPIModels';
import * as loginActions from 'app/actions/login';
import * as accountActions from 'app/actions/accounts';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case accountActions.RECEIVED_ACCOUNT: {
      const { accounts } = action.apiResponse;

      // Enforce new experiments
      // @TODO: remove this after tests
      Object.keys(accounts).forEach(accountName => {
        const account = accounts[accountName];
        accounts[accountName] = account.set({
          features: {
            ...(account.features || {}),
            mweb_xpromo_interstitial_comments_ios: {
              variant: 'treatment',
              owner: 'channels',
              experiment_id: 136,
            },
            mweb_xpromo_require_login_ios: {
              variant: 'login_required',
              owner: 'channels',
              experiment_id: 133,
            },
          },
        });
      });

      return mergeAPIModels(state, accounts);
    }

    default: return state;
  }
}
