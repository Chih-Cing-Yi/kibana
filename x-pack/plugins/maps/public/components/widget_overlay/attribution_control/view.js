/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import _ from 'lodash';
import {
  EuiText,
  EuiPanel,
  EuiLink,
} from '@elastic/eui';


export class AttributionControl  extends React.Component {

  state = {
    uniqueAttributions: []
  }

  componentDidMount() {
    this._isMounted = true;
    this._syncMbMapWithAttribution();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate() {
    this._syncMbMapWithAttribution();
  }

  _syncMbMapWithAttribution = async () => {

    const attributionPromises = this.props.layerList.map(async (layer) => {
      try {
        return await layer.getAttributions();
      } catch (error) {
        return [];
      }
    });
    const attributions = await Promise.all(attributionPromises);
    if (!this._isMounted) {
      return;
    }

    const uniqueAttributions = [];
    for (let i = 0; i < attributions.length; i++) {
      for (let j = 0; j < attributions[i].length; j++) {
        const testAttr = attributions[i][j];
        const attr = uniqueAttributions.find((added) => {
          return (added.url === testAttr.url && added.label === testAttr.label);
        });
        if (!attr) {
          uniqueAttributions.push(testAttr);
        }
      }
    }
    if (!_.isEqual(this.state.uniqueAttributions, uniqueAttributions)) {
      this.setState({ uniqueAttributions });
    }
  };

  _renderAttributions() {
    return this.state.uniqueAttributions.map((attribution, index) => {
      return (
        <Fragment key={index}>
          <EuiLink color="subdued" href={attribution.url} target="_blank">{attribution.label}</EuiLink>
          {index < (this.state.uniqueAttributions.length - 1) && ', '}
        </Fragment>
      );
    });
  }

  render() {
    if (this.state.uniqueAttributions.length === 0) {
      return null;
    }
    return (
      <EuiPanel className="mapWidgetControl mapAttributionControl" paddingSize="none" grow={false}>
        <EuiText color="subdued" size="xs">
          <small>{this._renderAttributions()}</small>
        </EuiText>
      </EuiPanel>
    );
  }
}
