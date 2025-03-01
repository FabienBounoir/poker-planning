const arraysAreEqual = (arr1, arr2) =>
    arr1?.length === arr2?.length && arr1.every((val, index) => val === arr2[index]);


module.exports = {
    arraysAreEqual,
};