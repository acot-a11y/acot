describe('tryResolveModule', () => {
  let mock: jest.Mock;

  beforeEach(() => {
    mock = jest.fn();
    jest.doMock('../resolve-module', () => ({
      resolveModule: mock,
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('success', async () => {
    const { tryResolveModule } = await import('../try-resolve-module');

    mock.mockReturnValueOnce('success1').mockReturnValueOnce('success2');

    expect(tryResolveModule('id1')).toEqual(['success1', null]);
    expect(mock).toBeCalledWith('id1', undefined);

    expect(tryResolveModule('id2', 'from')).toEqual(['success2', null]);
    expect(mock).toBeCalledWith('id2', 'from');
  });

  test('failure', async () => {
    const { tryResolveModule } = await import('../try-resolve-module');
    const error = new Error('test');

    mock.mockImplementationOnce(() => {
      throw error;
    });

    expect(tryResolveModule('__invalid_module__')).toEqual([null, error]);
  });
});
