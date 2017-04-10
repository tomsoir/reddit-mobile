import createTest from 'platform/createTest';
import { METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import routes from 'app/router';
import smartBanner, { DEFAULT } from './smartBanner';

import * as xpromoActions from 'app/actions/xpromo';


createTest({ reducers: { smartBanner }, routes }, ({ getStore, expect }) => {
  describe('smartBanner', () => {
    describe('SHOW', () => {
      it('should show the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        const expected = {
          ...DEFAULT,
          showBanner: true,
        };

        store.dispatch(xpromoActions.show());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(expected);
      });
    });

    describe('HIDE', () => {
      it('should hide the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Show and then hide to make sure we're setting and then clearing
        // The SHOW test verifies that setting works.
        store.dispatch(xpromoActions.show('foo', 'bar'));
        store.dispatch(xpromoActions.hide());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(DEFAULT);
      });
    });

    describe('RECORD_SHOWN', () => {
      it('should mark that we have shown an xpromo', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        const url = '/foo/bar';

        // Indicate desire to show, and then record that we showed.
        store.dispatch(xpromoActions.show());
        store.dispatch(xpromoActions.recordShown(url));
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql({
          ...DEFAULT,
          showBanner: true,
          haveShownXPromo: true,
          xPromoShownUrl: url,
        });
      });
    });

    describe('SCROLLPAST', () => {
      it('should change store status after viewport has been scrolled down', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        store.dispatch(xpromoActions.promoScrollPast());
        const { smartBanner } = store.getState();
        expect(smartBanner.scrolledPast).to.eql(true);
      });
    });

    describe('SCROLLUP', () => {
      it('should change the store status after viewport has been scrolled up', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        store.dispatch(xpromoActions.promoScrollUp());
        const { smartBanner } = store.getState();
        expect(smartBanner.scrolledPast).to.eql(false);
      });
    });

    describe('CAN_LISTING_CLICK', () => {
      it('should change `canListingClick` to be true', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        store.dispatch(xpromoActions.canListingClick());
        const { smartBanner } = store.getState();
        expect(smartBanner.canListingClick).to.eql(true);
      });
    });

    describe('MARK_LISTING_CLICK_TIMESTAMP', () => {
      it('should change `canListingClick` to be false', () => {
        const { store } = getStore({ smartBanner: {
          ...DEFAULT,
          canListingClick: true,
        }});
        store.dispatch({ type: xpromoActions.MARK_LISTING_CLICK_TIMESTAMP });
        const { smartBanner } = store.getState();
        expect(smartBanner.canListingClick).to.eql(false);
      });
    });

    describe('XPROMO_LISTING_CLICKED', () => {
      it('should change `showingListingClickInterstitial` to true', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        store.dispatch(xpromoActions.promoListingClicked());
        const { smartBanner } = store.getState();
        expect(smartBanner.showingListingClickInterstitial).to.eql(true);
      });
    });

    describe('XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL', () => {
      it('should change `showingListingClickInterstitial` to be false', () => {
        const { store } = getStore({ smartBanner: {
          ...DEFAULT,
          showingListingClickInterstitial: true,
        }});
        store.dispatch({ type: xpromoActions.XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL });
        const { smartBanner } = store.getState();
        expect(smartBanner.showingListingClickInterstitial).to.eql(false);
      });
    });

    describe('PLATFORM__NAVIGATE_TO_URL', () => {
      it('should not remove desire to show xpromo if we have already shown it once and navigate to another app url', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Indicate desire to show, record that we showed, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(xpromoActions.recordShown('/foo/bar'));
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { smartBanner } = store.getState();
        const { showBanner } = smartBanner;
        expect(showBanner).to.eql(true);
      });

      it('should not remove desire to show xpromo if we have not shown it yet', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Indicate desire to show, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { smartBanner } = store.getState();
        const { showBanner } = smartBanner;
        expect(showBanner).to.eql(true);
      });
    });

    describe('PROMO_DISMISS_CLICKED', () => {
      it('should change `dismissed` to be false', () => {
        const { store } = getStore({ smartBanner: {
          ...DEFAULT,
          dismissed: false,
        }});
        store.dispatch({ type: xpromoActions.PROMO_DISMISS_CLICKED });
        const { smartBanner } = store.getState();
        expect(smartBanner.dismissed).to.eql(true);
      });
    });
  });
});
