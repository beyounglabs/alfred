import { TestCase } from '../../../src/tests/test.case';
import { expect } from 'chai';
import { Container } from 'typedi';
import { RemoveAccents } from '../../../src/helpers/remove.accents';

const testCase = Container.get(TestCase);

describe('RemoveSpecialChars', () => {
    it('removes special chars correctly', async () => {
        const original = 'IgÛáÇçúÚÊÜë';
        const expected = 'IgUaCcuUEUe';

        const converted = RemoveAccents.remove(original);

        expect(expected).to.be.equals(converted);
    });
});
