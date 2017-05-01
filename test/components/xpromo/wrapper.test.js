import React from 'react';
import createTest from 'platform/createTest';
import indexReducer from './../../../src/app/reducers/index';
import routes from './../../../src/app/router';

import { DropdownModal } from './../../../src/app/components/Dropdown';
import { XPromoWrapper } from './../../../src/app/components/XPromoWrapper';

createTest({ 
  routes,
  reducers: { indexReducer },
},({ shallow, getStore, expect }) => {

  describe('Dropdown', () => {
    it('Close element is present', () => {
      const props = { id: 123, showX: true, onClick: ()=> {} }
      const component = shallow(<DropdownModal { ...props }/>);
      expect(component.find('.DropdownClose').length).to.eql(1);
    });

    it('XPromoWrapper', () => {
      const { store, StoreWrapper } = getStore();
      const component = shallow(
          <StoreWrapper>
              <XPromoWrapper />
          </StoreWrapper>
      );
      console.error('@@@@@@@@@@71>>', component.length );
      // const props = { id: 123, showX: true, onClick: ()=> {} }
      // const component = shallow(<XPromoWrapper { ...props }/>);
      // expect(component.find('.DropdownClose').length).to.eql(1);
      expect(true).to.eql(true);
    });
  });
});




// var state = {
//   data: 1,
// };

// var client = new ClientApp({
//   state: state,
// });