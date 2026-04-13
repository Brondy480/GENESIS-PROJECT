describe('Escrow Management Logic', () => {

    test('escrow fee calculation is correct', () => {
      const calculateEscrowRelease = (lockedAmount, platformFeePercent = 5) => {
        if (lockedAmount <= 0) throw new Error('Amount must be positive');
        const platformFee = lockedAmount * (platformFeePercent / 100);
        const creatorReceives = lockedAmount - platformFee;
        return {
          lockedAmount,
          platformFee,
          creatorReceives,
          feePercent: platformFeePercent
        };
      };
  
      const result = calculateEscrowRelease(1000000);
      expect(result.platformFee).toBe(50000);
      expect(result.creatorReceives).toBe(950000);
      expect(result.feePercent).toBe(5);
    });
  
    test('escrow cannot be released with zero amount', () => {
      const calculateEscrowRelease = (amount) => {
        if (amount <= 0) throw new Error('Amount must be positive');
        return amount * 0.95;
      };
  
      expect(() => calculateEscrowRelease(0)).toThrow();
      expect(() => calculateEscrowRelease(-500)).toThrow();
    });
  
    test('both parties must sign before validation', () => {
      const canValidate = (creatorSigned, investorSigned) => {
        return creatorSigned === true && investorSigned === true;
      };
  
      expect(canValidate(true, true)).toBe(true);
      expect(canValidate(true, false)).toBe(false);
      expect(canValidate(false, true)).toBe(false);
      expect(canValidate(false, false)).toBe(false);
    });
  
    test('escrow can only be released after validation', () => {
      const canRelease = (status) => status === 'validated';
  
      expect(canRelease('validated')).toBe(true);
      expect(canRelease('awaiting_validation')).toBe(false);
      expect(canRelease('awaiting_signatures')).toBe(false);
      expect(canRelease('released')).toBe(false);
    });
  
    test('shareholder record requires active deal', () => {
      const canCreateShareholder = (dealStatus, escrowStatus) => {
        return dealStatus === 'active' && escrowStatus === 'released';
      };
  
      expect(canCreateShareholder('active', 'released')).toBe(true);
      expect(canCreateShareholder('awaiting_payment', 'released')).toBe(false);
      expect(canCreateShareholder('active', 'validated')).toBe(false);
    });
  
    test('equity percentage must not exceed available equity', () => {
      const validateEquityRequest = (requested, available) => {
        if (requested > available) {
          throw new Error('Requested equity exceeds available equity');
        }
        return true;
      };
  
      expect(validateEquityRequest(10, 20)).toBe(true);
      expect(validateEquityRequest(20, 20)).toBe(true);
      expect(() => validateEquityRequest(25, 20)).toThrow();
    });
  
  });