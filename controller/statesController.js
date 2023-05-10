const State = require('../model/state');

// Initialize variable "data" for data within the "statesData.json" file.
const data = {
    states: require('../model/stateData.json'),
    setStates: function (data) { this.states = data }
  };
  
  // Initialize variable to identify Alaska "AK" and Hawaii "HI" as non-contiguous states.
  const nonContig = ['AK', 'HI'];
  
  // GetAllSates route to return all states
  const getAllStates = async (req, res) => {
    try {
      const funfacts = await State.find();
      const contig = req.query.contig;
      const filteredStates = contig === 'false'
        ? data.states.filter(state => nonContig.includes(state.code))
        : data.states.filter(state => !nonContig.includes(state.code));
  
      const result = filteredStates.map(item1 => {
        const match = funfacts.find(item2 => item2.stateCode.toUpperCase() === item1.code.toUpperCase());
        if (match) {
          console.log(match);
          return {...item1, funfacts: match.funfacts};
        } else {
          return {...item1};
        }
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

  const createNewState = async (req, res, next) => {
    try {
      const state = new State(req.body);
      const newState = await state.save();
      res.status(201).json({ success: true, data: newState });
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  };
  
  const updateState = async (req, res, next) => {
    try {
      const { id } = req.params;
      const update = req.body;
      const options = { new: true, runValidators: true };
      const updatedState = await State.findByIdAndUpdate(id, update, options);
      if (!updatedState) {
        res.status(404);
        throw new Error(`State with id ${id} not found`);
      }
      res.status(200).json({ success: true, data: updatedState });
    } catch (error) {
      next(error);
    }
  };
  
  const deleteState = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedState = await State.findByIdAndDelete(id);
      if (!deletedState) {
        return res.status(404).json({ success: false, error: `State with id ${id} not found` });
      }
      return res.status(200).json({ success: true, data: {} });
    } catch (error) {
      return next(error);
    }
  };
  
  const getState = async (req, res, next) => {
    try {
      const stateCode = req.params.code.toUpperCase();
      const state = await State.findOne({ stateCode });
      
      if (!state) {
        const error = new Error(`State with code ${stateCode} not found`);
        error.status = 404;
        throw error;
      }
  
      res.status(200).json({ success: true, data: state });
    } catch (error) {
      next(error);
    }
  };  

  const getFunfact = async (req, res, next) => {
    try {
      const stateCode = req.params.code.toUpperCase();
      const state = await State.findOne({ stateCode });
  
      if (!state) {
        return res.status(404).json({ message: `No fun facts found for ${stateCode}` });
      }
  
      const funfacts = state.funfacts;
      if (!funfacts || funfacts.length === 0) {
        return res.status(404).json({ message: `No fun facts found for ${stateCode}` });
      }
  
      const randomIndex = Math.floor(Math.random() * funfacts.length);
      const funfact = funfacts[randomIndex];
      res.json({ funfact });
    } catch (error) {
      next(error);
    }
  };

  // Setup createFunfact to add new funfacts about an existing state to the MongoDB database.
const createFunfact = async (req, res) => {
    try {
      const { funfacts } = req.body;
  
      if (!funfacts || !Array.isArray(funfacts)) {
        return res.status(400).json({ "message": "Invalid request body" });
      }
  
      const state = await State.findOneAndUpdate(
        { stateCode: req.params.code },
        { $push: { funfacts } },
        { upsert: true, new: true }
      );
  
      if (!state) {
        return res.status(404).json({ "message": "State not found" });
      }
  
      res.json(state);
    } catch (error) {
      console.log(error);
      res.status(500).json({ "message": "Internal server error" });
    }
  };
  
  const patchFunfact = async (req, res) => {
    const code = req.params.code;
    const index = req.body.index;
    const funfact = req.body.funfact;
  
    if (!index) {
      return res.status(400).json({ "message": "State fun fact index value required" });
    }
    if (!funfact || funfact.length === 0) {
      return res.status(400).json({ "message": "State fun fact value required" });
    }
  
    const adjustedIndex = index - 1;
    const stateData = data.states.find(state => state.code === code);
    const state = await State.findOne({ stateCode: code });
  
    if (!state?.funfacts || state?.funfacts?.length === 0) {
      return res.status(404).json({ "message": `No fun facts found for ${stateData?.state}` });
    }
  
    if (index > state?.funfacts?.length) {
      return res.status(404).json({ "message": `No fun fact found at index ${index} for ${stateData?.state}` });
    }
  
    try {
      const filter = { stateCode: code };
      const update = { $set: { [`funfacts.${adjustedIndex}`]: funfact } };
      const result = await State.updateOne(filter, update);
  
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  };

  
  const deleteFunfact = async (req, res) => {
    const code = req.params.code;
    const index = req.body.index;
  
    if (!index) {
      return res.status(400).json({ "message": "State fun fact index value required" });
    }
  
    // Adjust index for zero-based array
    const adjustedIndex = index - 1;
  
    const state = await State.findOne({ stateCode: code });
    if (!state?.funfacts || state.funfacts.length === 0) {
      const stateData = data.states.find((state) => state.code === code);
      return res.status(404).json({ "message": `No Fun Facts found for ${stateData?.state}` });
    }
  
    if (index > state.funfacts.length) {
      const stateData = data.states.find((state) => state.code === code);
      return res.status(404).json({ "message": `No Fun Fact found at that index for ${stateData?.state}` });
    }
  
    const filter = { stateCode: code };
    const update = { $unset: { [`funfacts.${adjustedIndex}`]: 1 } };
    const remove = { $pull: { funfacts: null } };
  
    try {
      await State.updateOne(filter, update);
      await State.updateOne(filter, remove);
      res.send({ "message": `Fun fact at index ${index} removed for ${state.name}` });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  };
  
  // Return the state capital for the specified state in the statesData.json file.
const getCapital = async (req, res, next) => {
    try {
    const capital = getStateData(req.params.code.toUpperCase(), 'capital', res);
    return res.json(capital);
    } catch (err) {
    return next(err);
    }
    };
    
    // Return the state nickname for the specified state in the statesData.json file.
    const getNickName = async (req, res, next) => {
    try {
    const nickname = getStateData(req.params.code.toUpperCase(), 'nickname', res);
    return res.json(nickname);
    } catch (err) {
    return next(err);
    }
    };
    
    // Return the state population for the specified state in the statesData.json file.
    const getPopulation = async (req, res, next) => {
    try {
    const population = getStateData(req.params.code.toUpperCase(), 'population', res);
    return res.json(population);
    } catch (err) {
    return next(err);
    }
    };

    // Return the admission date for the specified state in the statesData.json file.
const getAdmission = async (req, res, next) => {
    try {
      const admitted = getStateData(req.params.code.toUpperCase(), 'admitted', res)
      res.json(admitted);
    } catch (err) {
      next(err);
    }
  };
  
  // Return all the available data for the specified state.
  const getStateData = (code, type, res) => {
    const state = data.states.find(state => state.code === code);
    if (!state) {
      throw new Error(`Invalid state abbreviation parameter`);
    }
    let result = { state: state.state };
    switch (type) {
      case 'capital':
        result.capital = state.capital_city;
        break;
      case 'nickname':
        result.nickname = state.nickname;
        break;
      case 'population':
        result.population = state.population;
        break;
      case 'admitted':
        result.admitted = state.admission_date;
        break;
      default:
        throw new Error(`Invalid data type parameter`);
    }
    return result;
  };
  
  module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState,
    getState,
    getFunfact,
    getPopulation,
    getAdmission,
    getCapital,
    getNickName,
    createFunfact,
    patchFunfact,
    deleteFunfact
};