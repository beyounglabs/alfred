import { expect } from 'chai';
import { RemoveAccents } from '../../../src/helpers/remove.accents';

describe('RemoveSpecialChars', () => {
  it('removes special chars correctly', async () => {
    const original = 'IgÛáÇçúÚÊÜë';
    const expected = 'IgUaCcuUEUe';

    const converted = RemoveAccents.remove(original);

    expect(expected).to.be.equals(converted);
  });
});
