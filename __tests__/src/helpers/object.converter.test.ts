import { expect } from 'chai';
import { ObjectConverter } from '../../../src/helpers/object.converter';

describe('ObjectConverter', () => {
  it('underscoreToCamelCase', async () => {
    const original = {
      my_name: 'AAA',
      extra_info: {
        birth_date: '2019-01-01',
      },
      items: [
        {
          my_product: [
            {
              extra: {
                expiration_date: '2020-12-06',
              },
            },
          ],
        },
      ],
    };
    const expected = {
      myName: 'AAA',
      extraInfo: {
        birthDate: '2019-01-01',
      },
      items: [
        {
          myProduct: [
            {
              extra: {
                expirationDate: '2020-12-06',
              },
            },
          ],
        },
      ],
    };

    const converted = ObjectConverter.underscoreToCamelCase(original);

    expect(JSON.stringify(expected, null, 2)).to.be.equals(
      JSON.stringify(converted, null, 2),
    );
  });

  it('camelCaseToUnderscore', async () => {
    const original = {
      myName: 'AAA',
      extraInfo: {
        birthDate: '2019-01-01',
      },
      items: [
        {
          myProduct: [
            {
              extra: {
                expirationDate: '2020-12-06',
              },
            },
          ],
        },
      ],
    };
    const expected = {
      my_name: 'AAA',
      extra_info: {
        birth_date: '2019-01-01',
      },
      items: [
        {
          my_product: [
            {
              extra: {
                expiration_date: '2020-12-06',
              },
            },
          ],
        },
      ],
    };

    const converted = ObjectConverter.camelCaseToUnderscore(original);

    expect(JSON.stringify(expected, null, 2)).to.be.equals(
      JSON.stringify(converted, null, 2),
    );
  });
});
