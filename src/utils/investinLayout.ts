import { Blob, seq, struct, u8, u32 } from 'buffer-layout';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

class PublicKeyLayout extends Blob {
  constructor(property: any) {
    super(32, property);
  }

  decode(b:any, offset: any) {
    return new PublicKey(super.decode(b, offset));
  }

  encode(src:any, b:any, offset:any) {
    return super.encode(src.toBuffer(), b, offset);
  }
}

export function publicKeyLayout(property = '') {
  return new PublicKeyLayout(property);
}

class BNLayout extends Blob {
  constructor(number:any, property:any) {
    super(number, property);
    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  decode(b:any, offset:any) {
    return new BN(super.decode(b, offset), 10, 'le');
  }

  encode(src:any, b:any, offset:any) {
    return super.encode(src.toArrayLike(Buffer, 'le', this['span']), b, offset);
  }
}

class U64F64Layout extends Blob {
  constructor(property:any) {
    super(16, property);
  }

  decode(b:any, offset:any) {
    const raw = new BN(super.decode(b, offset), 10, 'le');
    
    // @ts-ignore
    return raw / Math.pow(2, 64);
  }

  encode(src:any, b:any, offset:any) {
    console.log('src ::: ', src);
    return super.encode(src.toArrayLike(Buffer, 'le', this['span']), b, offset);
  }
}

export function U64F64(property = '') {
  return new U64F64Layout(property);
}

export function u64(property = '') {
  return new BNLayout(8, property);
}

export function u128(property = '') {
  return new BNLayout(16, property);
}

export const XENON_DATA = struct([
  u8('is_initialized'),
  u8('bump'),
  seq(u8(), 6, 'padding'),

  publicKeyLayout('admin'),
  publicKeyLayout('vault'),
  publicKeyLayout('mint_key'),

  U64F64('total_deposits'),
  U64F64('total_borrows'),

  U64F64('maint_coll_ratio'),
  U64F64('init_coll_ratio'),

  U64F64('deposit_index'),
  U64F64('borrow_index'),

  u64('last_updated'),
  seq(u64(), 64, 'xpadding'),
]);

export const MARGIN_DATA = struct([
  u8('is_initialized'),
  u8('bump'),
  u8('borrow_active'),
  seq(u8(), 5, 'padding'),

  publicKeyLayout('xenon_pda'),
  publicKeyLayout('owner'),
  publicKeyLayout('vault'),

  U64F64('assets'),
  U64F64('liabs'),
]);

export const ACCOUNT_LAYOUT = struct([
    publicKeyLayout('mint'),
    publicKeyLayout('owner'),
    u64('amount'),
    u32('delegateOption'),
    publicKeyLayout('delegate'),
    u8('state'),
    u32('isNativeOption'),
    u64('isNative'),
    u64('delegatedAmount'),
    u32('closeAuthorityOption'),
    publicKeyLayout('closeAuthority')
  ]);