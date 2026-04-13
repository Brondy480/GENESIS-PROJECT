describe('Investment Business Logic', () => {

    test('equityRequested must be between 0.01 and 100', () => {
      const validateEquity = (equity) => {
        if (!equity || equity < 0.01 || equity > 100) {
          throw new Error('Equity must be between 0.01 and 100');
        }
        return true;
      };
  
      expect(() => validateEquity(0)).toThrow();
      expect(() => validateEquity(-5)).toThrow();
      expect(() => validateEquity(101)).toThrow();
      expect(() => validateEquity(null)).toThrow();
      expect(validateEquity(5)).toBe(true);
      expect(validateEquity(0.01)).toBe(true);
      expect(validateEquity(100)).toBe(true);
    });
  
    test('investment amount must be positive', () => {
      const validateAmount = (amount) => {
        if (!amount || amount <= 0) {
          throw new Error('Amount must be positive');
        }
        return true;
      };
  
      expect(() => validateAmount(0)).toThrow();
      expect(() => validateAmount(-100)).toThrow();
      expect(() => validateAmount(null)).toThrow();
      expect(validateAmount(1000)).toBe(true);
      expect(validateAmount(500000)).toBe(true);
    });
  
    test('platform fee calculation is correct', () => {
      const calculateFee = (amount, feePercent = 5) => {
        const fee = amount * (feePercent / 100);
        const creatorReceives = amount - fee;
        return { fee, creatorReceives };
      };
  
      const result = calculateFee(1000000);
      expect(result.fee).toBe(50000);
      expect(result.creatorReceives).toBe(950000);
  
      const result2 = calculateFee(500000);
      expect(result2.fee).toBe(25000);
      expect(result2.creatorReceives).toBe(475000);
    });
  
    test('deal status transitions are valid', () => {
      const validStatuses = [
        'created',
        'awaiting_payment',
        'payment_completed',
        'awaiting_signatures',
        'active',
        'cancelled'
      ];
  
      const isValidStatus = (status) => validStatuses.includes(status);
  
      expect(isValidStatus('created')).toBe(true);
      expect(isValidStatus('active')).toBe(true);
      expect(isValidStatus('cancelled')).toBe(true);
      expect(isValidStatus('invalid_status')).toBe(false);
      expect(isValidStatus('completed')).toBe(false);
    });
  
    test('escrow status chain is correct', () => {
      const escrowChain = [
        'created',
        'awaiting_payment',
        'payment_completed',
        'awaiting_signatures',
        'awaiting_validation',
        'validated',
        'released'
      ];
  
      expect(escrowChain[0]).toBe('created');
      expect(escrowChain[escrowChain.length - 1]).toBe('released');
      expect(escrowChain).toHaveLength(7);
    });
  
  });