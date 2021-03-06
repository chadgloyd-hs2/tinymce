import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:simple-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentApi = Cell<Dialog.DialogInstanceApi<any>>({ } as any);

  const store = TestHelpers.TestStore();

  const sTestOpen = Chain.asStep({ }, [
    Chain.injectThunked(() => windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          }
        ]
      },
      buttons: [
        {
          type: 'custom',
          name: 'barny',
          text: 'Barny Text',
          align: 'start',
          primary: true
        }
      ],
      initialData: {
        fred: 'said hello pebbles'
      },
      onSubmit: store.adder('onSubmit'),
      onClose: store.adder('onClose'),
      onChange: store.adder('onChange'),
      onAction: store.adder('onAction')
    }, {}, () => store.adder('closeWindow')())),

    Chain.op((dialogApi) => {
      Assertions.assertEq('Initial data', {
        fred: 'said hello pebbles'
      }, dialogApi.getData());

      currentApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(SugarBody.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(SugarBody.body(), '[role="dialog"]')
  ]);

  Pipeline.async({}, [
    sTestOpen,
    FocusTools.sTryOnSelector(
      'Focus should start on the input',
      SugarElement.fromDom(document),
      'input'
    ),
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should exist on the body',
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ arr.has('tox-dialog__disable-scroll') ]
      })),
      SugarBody.body()
    ),
    Step.sync(() => {
      currentApi.get().disable('barny');
    }),
    sTestClose,
    Waiter.sTryUntil(
      'Waiting for all dialog events when closing',
      store.sAssertEq('Checking stuff', [
        'closeWindow',
        'onClose'
      ])
    ),
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should have been removed from the body',
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ arr.not('tox-dialog__disable-scroll') ]
      })),
      SugarBody.body()
    )
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});
