use poseidon::poseidon2;
mod merkle_tree;
fn main(
    root: pub Field,
    nullifier_hash: pub Field,
    borrow_amount: pub u128,
    asset_price: pub u128,
    minimum_collateralization_ratio: pub u128,
    tokenId: pub u64,
    recepient: pub Field,
    epoch_commitment: pub Field,
    epoch: pub u128,

    nullifier: Field,
    secret: Field,
    merkle_proof: [Field;16],
    is_even: [bool;16],
    amount: u128,
    actual_collateralization_ratio: u128,
    roundId: u64,
    price: u128
){
    assert(actual_collateralization_ratio>=minimum_collateralization_ratio);
    let generated_commitment = poseidon2::Poseidon2::hash([nullifier,secret,amount as Field,tokenId as Field],4);
    let computed_nullifier_hash = poseidon2::Poseidon2::hash([nullifier, nullifier], 2);
    assert(nullifier_hash == computed_nullifier_hash);
    let computed_root = merkle_tree::compute_merkle_root(generated_commitment, merkle_proof, is_even);
    assert(root == computed_root);
    assert(amount*asset_price>=((borrow_amount*actual_collateralization_ratio)/100));
    assert(recepient*recepient==recepient*recepient);
    assert(poseidon2::Poseidon2::hash([roundId as Field,price as Field],2)==epoch_commitment);
    assert(epoch*epoch==epoch*epoch);

}